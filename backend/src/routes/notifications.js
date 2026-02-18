import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get notifications
router.get('/', requireAuth, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json({ notifications });
    } catch (err) {
        console.error('GET /api/notifications error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark as read
router.patch('/:id/read', requireAuth, async (req, res) => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (err) {
        console.error('PATCH /api/notifications/:id/read error:', err);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Mark all as read
router.patch('/read-all', requireAuth, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, read: false },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (err) {
        console.error('PATCH /api/notifications/read-all error:', err);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

export default router;
