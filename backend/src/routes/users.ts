import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pt57_super_secret_key';

// Auth middleware reused inline
function getUser(req: Request): { id: string; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller) { res.status(401).json({ error: 'Unauthorized.' }); return; }

  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, email: true, role: true, department: true, createdAt: true, peers: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const mapped = users.map(u => ({ ...u, peersCount: u.peers.length, peers: undefined }));
  res.json(mapped);
});

// POST /api/users
router.post('/', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller || !['SUPER_ADMIN', 'ADMIN'].includes(caller.role)) {
    res.status(403).json({ error: 'Forbidden.' }); return;
  }
  const { fullName, email, password, role, department } = req.body;
  if (!fullName || !email || !password) {
    res.status(400).json({ error: 'fullName, email and password are required.' }); return;
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: role || 'ADMIN', department: department || 'Engineering' },
    });
    await prisma.auditLog.create({
      data: { user: 'System', action: `Created user ${fullName} (${email})`, severity: 'INFO' },
    });
    res.status(201).json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, department: user.department });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Email already exists.' }); return;
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller || caller.role !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Forbidden. Only SUPER_ADMIN can delete users.' }); return;
  }
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
    await prisma.user.delete({ where: { id } }); // cascades peers
    await prisma.auditLog.create({
      data: { user: 'System', action: `Deleted user ${user.fullName} (${user.email})`, severity: 'WARNING' },
    });
    res.json({ message: 'User deleted.' });
  } catch {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
