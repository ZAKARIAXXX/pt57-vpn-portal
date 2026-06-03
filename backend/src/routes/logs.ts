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

// GET /api/logs
router.get('/', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller) { res.status(401).json({ error: 'Unauthorized.' }); return; }

  const { severity } = req.query;
  const where = severity && severity !== 'ALL' ? { severity: severity as string } : {};

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 200,
  });
  res.json(logs);
});

// GET /api/logs/export — CSV download
router.get('/export', async (req: Request, res: Response) => {
  const caller = getUser(req);
  if (!caller) { res.status(401).json({ error: 'Unauthorized.' }); return; }

  const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' } });
  const header = 'ID,Timestamp,User,Action,Severity\n';
  const rows = logs.map(l =>
    `"${l.id}","${l.timestamp.toISOString()}","${l.user}","${l.action}","${l.severity}"`
  ).join('\n');

  res.setHeader('Content-Disposition', 'attachment; filename="pt57_vpn_audit_logs.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(header + rows);
});

export default router;
