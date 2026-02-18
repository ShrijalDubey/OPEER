import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import threadRoutes from './routes/threads.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Middleware ──────────────────────────────────────────

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ─── Passport Configuration ─────────────────────────────

console.log('\n🔧 Configuring OAuth strategies...');
configurePassport();

// ─── Routes ─────────────────────────────────────────────

app.use('/auth', authRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health Check ───────────────────────────────────────

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ────────────────────────────────────────

app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ─── Error Handler ──────────────────────────────────────

app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ───────────────────────────────────────

app.listen(PORT, () => {
    console.log(`\n🚀 OPEER API running at http://localhost:${PORT}`);
    console.log(`   Frontend URL: ${FRONTEND_URL}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
