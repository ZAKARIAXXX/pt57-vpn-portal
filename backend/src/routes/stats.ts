import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pt57_super_secret_key';

function getUser(req: Request): { id: string; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as { id: string; role: string }; }
  catch { return null; }
}

// GET /api/stats/overview
router.get('/overview', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller) { res.status(401).json({ error: 'Unauthorized.' }); return; }

  const totalUsers = await prisma.user.count();
  const totalPeers = await prisma.peer.count();
  const activePeers = await prisma.peer.count({ where: { isActive: true } });
  const allPeers = await prisma.peer.findMany({ select: { txBytes: true, rxBytes: true } });
  const totalTx = allPeers.reduce((sum, p) => sum + p.txBytes, 0);
  const totalRx = allPeers.reduce((sum, p) => sum + p.rxBytes, 0);

  res.json({
    vpnStatus: 'ACTIVE',
    totalUsers,
    totalPeers,
    activePeers,
    totalTxBytes: totalTx,
    totalRxBytes: totalRx,
  });
});

// GET /api/stats/traffic — simulated live bandwidth data points
router.get('/traffic', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller) { res.status(401).json({ error: 'Unauthorized.' }); return; }

  // Generate a realistic-looking series with some variance
  const now = Date.now();
  const points = [];
  for (let i = 12; i >= 0; i--) {
    points.push({
      time: i === 0 ? 'now' : `${i * 2}s ago`,
      rx: Math.floor(Math.random() * 80) + 20,
      tx: Math.floor(Math.random() * 60) + 10,
      timestamp: now - i * 2000,
    });
  }
  res.json(points);
});

export default router;
