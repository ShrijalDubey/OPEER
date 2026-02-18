import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── Get current user's full profile ────────────────────

router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                provider: true,
                college: true,
                skills: true,
                year: true,
                bio: true,
                createdAt: true,
                threads: {
                    include: {
                        thread: {
                            select: { id: true, slug: true, name: true },
                        },
                    },
                },
                projects: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        createdAt: true,
                        thread: { select: { slug: true } },
                        applications: {
                            where: { status: 'accepted' },
                            select: { id: true }
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                applications: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        project: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                createdAt: true,
                                thread: { select: { slug: true } },
                                author: { select: { id: true, name: true, avatarUrl: true } },
                                applications: {
                                    where: { status: 'accepted' },
                                    select: { id: true }
                                }
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Flatten joined threads
        const joinedThreads = user.threads.map((tm) => tm.thread);

        res.json({
            user: {
                ...user,
                joinedThreads,
                threads: undefined, // remove raw ThreadMember data
            },
        });
    } catch (err) {
        console.error('GET /api/users/me error:', err);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// ─── Update current user's profile ──────────────────────

router.patch('/me', requireAuth, async (req, res) => {
    try {
        const { name, college, skills, year, bio } = req.body;

        const data = {};
        if (name !== undefined) data.name = name;
        if (college !== undefined) data.college = college;
        if (year !== undefined) data.year = year;
        if (bio !== undefined) data.bio = bio;
        if (skills !== undefined) {
            data.skills = Array.isArray(skills)
                ? skills
                : typeof skills === 'string'
                    ? skills.split(',').map((s) => s.trim()).filter(Boolean)
                    : [];
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                college: true,
                skills: true,
                year: true,
                bio: true,
            },
        });

        res.json({ user });
    } catch (err) {
        console.error('PATCH /api/users/me error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ─── Delete current user's account ──────────────────────

router.delete('/me', requireAuth, async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.user.id },
        });

        res.json({ message: 'Account deleted' });
    } catch (err) {
        console.error('DELETE /api/users/me error:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

export default router;
