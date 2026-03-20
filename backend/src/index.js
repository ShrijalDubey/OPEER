import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './lib/prisma.js';

import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import threadRoutes from './routes/threads.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Socket.io ───────────────────────────────────────────

export const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Verify JWT on every socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.userId}`);

  // Each user joins their own private room for notifications
  socket.join(`user:${socket.userId}`);

  // Join a project's chat room
  socket.on('join:project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`User ${socket.userId} joined project room ${projectId}`);
  });

  // Leave a project's chat room
  socket.on('leave:project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  // Handle sending a chat message
  socket.on('chat:send', async ({ projectId, content }) => {
    if (!content?.trim()) return;

    try {
      // Check user is actually a member before saving
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          applications: {
            where: { status: 'accepted', userId: socket.userId }
          }
        }
      });

      if (!project) return;

      const isMember = project.authorId === socket.userId ||
                       project.applications.length > 0;
      if (!isMember) return;

      // Save message to database
      const message = await prisma.projectMessage.create({
        data: { content, projectId, senderId: socket.userId },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } }
        }
      });

      // Broadcast to everyone in the project room including sender
      io.to(`project:${projectId}`).emit('chat:message', message);

    } catch (err) {
      console.error('Socket chat error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.userId}`);
  });
});

// ─── Middleware ──────────────────────────────────────────

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

console.log('\n🔧 Configuring OAuth strategies...');
configurePassport();

// ─── Routes ─────────────────────────────────────────────

app.use('/auth', authRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Use httpServer not app ──────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 OPEER API running at http://localhost:${PORT}`);
  console.log(`   Socket.io enabled ✓\n`);
});