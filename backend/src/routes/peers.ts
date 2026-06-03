import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { generateWireGuardKeys, generateClientConfig, addWireGuardPeer, removeWireGuardPeer, toggleWireGuardPeer, fetchPeerTraffic } from '../utils/wg';

function formatHandshake(unixSeconds: number): string {
  if (!unixSeconds || unixSeconds === 0) return 'Never';
  const diff = Math.floor(Date.now() / 1000) - unixSeconds;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pt57_super_secret_key';

function getUser(req: Request): { id: string; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as { id: string; role: string }; }
  catch { return null; }
}

// GET /api/peers
router.get('/', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller) { res.status(401).json({ error: 'Unauthorized.' }); return; }

  const peers = await prisma.peer.findMany({
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });

  let livePeers: { publicKey: string; txBytes: number; rxBytes: number; latestHandshake: number; endpoint: string }[] = [];
  try { livePeers = await fetchPeerTraffic(); } catch {}

  res.json(peers.map(p => {
    const live = livePeers.find(l => l.publicKey === p.publicKey);
    return {
      id: p.id,
      name: p.name,
      userName: p.user.fullName,
      userEmail: p.user.email,
      publicKey: p.publicKey,
      allowedIPs: p.allowedIPs,
      endpoint: live?.endpoint || p.endpoint,
      isActive: p.isActive,
      lastHandshake: live ? formatHandshake(live.latestHandshake) : p.lastHandshake,
      txBytes: live?.txBytes ?? p.txBytes,
      rxBytes: live?.rxBytes ?? p.rxBytes,
      createdAt: p.createdAt,
    };
  }));
});

// POST /api/peers  — provision a new WireGuard client
router.post('/', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller || !['SUPER_ADMIN', 'ADMIN'].includes(caller.role)) {
    res.status(403).json({ error: 'Forbidden.' }); return;
  }
  const { name, userId, allowedIPs } = req.body;
  if (!name || !userId || !allowedIPs) {
    res.status(400).json({ error: 'name, userId and allowedIPs are required.' }); return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }

    const { publicKey, privateKey } = generateWireGuardKeys();
    const serverPubKey = process.env.WG_SERVER_PUB_KEY || 'yfGpeKsP+3MQHebw/oBXi19x7NuCEEKultAyZQpvumY=';

    try {
      await addWireGuardPeer(publicKey, allowedIPs);
    } catch (sshErr: any) {
      res.status(502).json({ error: `Failed to add peer on WireGuard server: ${sshErr.message}` });
      return;
    }

    const peer = await prisma.peer.create({
      data: { name, userId, publicKey, allowedIPs, isActive: true },
    });
    await prisma.auditLog.create({
      data: { user: 'System', action: `Created peer "${name}" for ${user.fullName}`, severity: 'INFO' },
    });
    res.status(201).json({
      id: peer.id,
      name: peer.name,
      publicKey: peer.publicKey,
      privateKey,
      allowedIPs: peer.allowedIPs,
      isActive: peer.isActive,
      configFile: generateClientConfig(allowedIPs, privateKey, serverPubKey),
    });
  } catch (err: any) {
    if (err.code === 'P2002') { res.status(409).json({ error: 'Public key collision, retry.' }); return; }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/peers/:id/status  — toggle active / revoked
router.put('/:id/status', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller || !['SUPER_ADMIN', 'ADMIN'].includes(caller.role)) {
    res.status(403).json({ error: 'Forbidden.' }); return;
  }
  const { id } = req.params;
  try {
    const peer = await prisma.peer.findUnique({ where: { id }, include: { user: true } });
    if (!peer) { res.status(404).json({ error: 'Peer not found.' }); return; }
    const newStatus = !peer.isActive;

    try {
      await toggleWireGuardPeer(peer.publicKey, newStatus ? 'activate' : 'revoke', peer.allowedIPs);
    } catch (sshErr: any) {
      res.status(502).json({ error: `WireGuard server error: ${sshErr.message}` });
      return;
    }

    const updated = await prisma.peer.update({
      where: { id },
      data: { isActive: newStatus, lastHandshake: newStatus ? new Date().toISOString() : null },
    });
    await prisma.auditLog.create({
      data: {
        user: 'System',
        action: `${newStatus ? 'Activated' : 'Revoked'} peer "${peer.name}" (${peer.user.fullName})`,
        severity: newStatus ? 'INFO' : 'CRITICAL',
      },
    });
    res.json({ id: updated.id, isActive: updated.isActive, lastHandshake: updated.lastHandshake });
  } catch {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/peers/:id/config  — download .conf file
router.get('/:id/config', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller) { res.status(401).json({ error: 'Unauthorized.' }); return; }
  const { id } = req.params;
  try {
    const peer = await prisma.peer.findUnique({ where: { id } });
    if (!peer) { res.status(404).json({ error: 'Peer not found.' }); return; }
    const serverPubKey = process.env.WG_SERVER_PUB_KEY || 'yfGpeKsP+3MQHebw/oBXi19x7NuCEEKultAyZQpvumY=';
    const config = generateClientConfig(peer.allowedIPs, '<CLIENT_PRIVATE_KEY>', serverPubKey);
    res.setHeader('Content-Disposition', `attachment; filename="${peer.name.replace(/\s+/g,'_')}_wireguard.conf"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(config);
  } catch {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/peers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller || !['SUPER_ADMIN', 'ADMIN'].includes(caller.role)) {
    res.status(403).json({ error: 'Forbidden.' }); return;
  }
  const { id } = req.params;
  try {
    const peer = await prisma.peer.findUnique({ where: { id }, include: { user: true } });
    if (!peer) { res.status(404).json({ error: 'Peer not found.' }); return; }
    try {
      await removeWireGuardPeer(peer.publicKey);
    } catch (sshErr: any) {
      res.status(502).json({ error: `WireGuard server error: ${sshErr.message}` });
      return;
    }
    await prisma.peer.delete({ where: { id } });
    await prisma.auditLog.create({
      data: { user: 'System', action: `Deleted peer "${peer.name}" (${peer.user.fullName})`, severity: 'WARNING' },
    });
    res.json({ message: 'Peer deleted.' });
  } catch {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
