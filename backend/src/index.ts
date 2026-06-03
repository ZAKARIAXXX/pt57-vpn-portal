import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import prisma from './utils/prisma';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import peersRoutes from './routes/peers';
import statsRoutes from './routes/stats';
import logsRoutes from './routes/logs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/peers', peersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/logs', logsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PT57 VPN Admin API', uptime: process.uptime() });
});

// ─── Database Seed ──────────────────────────────────────────
// Creates default admin and sample data on first launch
async function seed() {
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@enterprise.com' } });
  if (existingAdmin) return; // already seeded

  console.log('🌱 Seeding database with default data...');

  const hash = await bcrypt.hash('admin123', 10);

  const alice = await prisma.user.create({
    data: { fullName: 'Alice Vance', email: 'admin@enterprise.com', passwordHash: hash, role: 'SUPER_ADMIN', department: 'Engineering' },
  });
  const bob = await prisma.user.create({
    data: { fullName: 'Bob Carter', email: 'bob@enterprise.com', passwordHash: hash, role: 'ADMIN', department: 'IT Operations' },
  });
  const charlie = await prisma.user.create({
    data: { fullName: 'Charlie Davis', email: 'charlie@enterprise.com', passwordHash: hash, role: 'AUDITOR', department: 'Security Audit' },
  });

  // Seed peers
  await prisma.peer.createMany({
    data: [
      { name: 'MacBook Pro 16', userId: alice.id, publicKey: 'wg0+A2b8CxYz19Key=', allowedIPs: '10.8.0.2/32', endpoint: '198.51.100.42:51820', isActive: true, lastHandshake: '2 minutes ago', txBytes: 4210984, rxBytes: 25489700 },
      { name: 'iPhone 15', userId: alice.id, publicKey: 'wg0+K9m1XtUv45Key=', allowedIPs: '10.8.0.3/32', endpoint: '198.51.100.42:61902', isActive: true, lastHandshake: '5 minutes ago', txBytes: 852044, rxBytes: 3125400 },
      { name: 'Linux Server Backup', userId: bob.id, publicKey: 'wg0+Z6h2YqWp10Key=', allowedIPs: '10.8.0.4/32', isActive: false, txBytes: 0, rxBytes: 0 },
    ],
  });

  // Seed audit logs
  await prisma.auditLog.createMany({
    data: [
      { user: 'Alice Vance', action: 'Connected from 198.51.100.42', severity: 'INFO' },
      { user: 'Bob Carter', action: 'Generated Peer wg0+Z6h2Y...', severity: 'INFO' },
      { user: 'Charlie Davis', action: 'Failed Login Attempt from 203.0.113.8', severity: 'WARNING' },
    ],
  });

  console.log('✅ Seed complete. Default login: admin@enterprise.com / admin123');
}

// ─── Start Server ───────────────────────────────────────────
async function main() {
  await seed();
  app.listen(PORT, () => {
    console.log(`🚀 PT57 VPN Admin API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
