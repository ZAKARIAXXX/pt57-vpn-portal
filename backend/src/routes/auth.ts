import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pt57_super_secret_key';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    await prisma.auditLog.create({
      data: {
        user: user.fullName,
        action: `Logged in from API`,
        severity: 'INFO',
      },
    });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/auth/me  (requires Bearer token)
router.get('/me', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, fullName: true, role: true, department: true } });
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// POST /api/auth/logout  (stateless JWT – just log the event)
router.post('/logout', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { email: string; id: string };
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (user) {
        await prisma.auditLog.create({
          data: { user: user.fullName, action: 'Logged out', severity: 'INFO' },
        });
      }
    } catch { /* ignore invalid tokens on logout */ }
  }
  res.json({ message: 'Logged out.' });
});

export default router;
