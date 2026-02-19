import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── List all threads (with optional search) ───────────

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        const where = search
            ? {
                OR: [
                    { slug: { contains: search, mode: 'insensitive' } },
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const threads = await prisma.thread.findMany({
            where,
            include: {
                _count: {
                    select: {
                        members: true,
                        projects: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Flatten the _count for a cleaner API response
        const result = threads.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            description: t.description,
            memberCount: t._count.members,
            projectCount: t._count.projects,
            createdAt: t.createdAt,
        }));

        res.json({ threads: result });
    } catch (err) {
        console.error('GET /api/threads error:', err);
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
});

// ─── Get single thread by slug ──────────────────────────

router.get('/:slug', async (req, res) => {
    try {
        const thread = await prisma.thread.findUnique({
            where: { slug: req.params.slug },
            include: {
                _count: {
                    select: { members: true, projects: true },
                },
            },
        });

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        res.json({
            thread: {
                id: thread.id,
                slug: thread.slug,
                name: thread.name,
                description: thread.description,
                memberCount: thread._count.members,
                projectCount: thread._count.projects,
                createdAt: thread.createdAt,
            },
        });
    } catch (err) {
        console.error('GET /api/threads/:slug error:', err);
        res.status(500).json({ error: 'Failed to fetch thread' });
    }
});

// ─── Create a new thread (auth required) ────────────────

router.post('/', requireAuth, async (req, res) => {
    try {
        const { slug, name, description } = req.body;

        if (!slug || !name) {
            return res.status(400).json({ error: 'slug and name are required' });
        }

        // Normalize slug
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        const existing = await prisma.thread.findUnique({ where: { slug: normalizedSlug } });
        if (existing) {
            return res.status(409).json({ error: `Thread /${normalizedSlug} already exists` });
        }

        const thread = await prisma.thread.create({
            data: { slug: normalizedSlug, name, description, creatorId: req.user.id },
        });

        // Auto-join the creator
        await prisma.threadMember.create({
            data: { userId: req.user.id, threadId: thread.id },
        });

        res.status(201).json({ thread });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'A thread with this name already exists' });
        }
        console.error('POST /api/threads error:', err);
        res.status(500).json({ error: 'Failed to create thread' });
    }
});

// ─── Join a thread (auth required) ──────────────────────

router.post('/:slug/join', requireAuth, async (req, res) => {
    try {
        const thread = await prisma.thread.findUnique({
            where: { slug: req.params.slug },
        });

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        // Check if already a member
        const existing = await prisma.threadMember.findUnique({
            where: { userId_threadId: { userId: req.user.id, threadId: thread.id } },
        });

        if (existing) {
            return res.status(409).json({ error: 'Already a member of this thread' });
        }

        await prisma.threadMember.create({
            data: { userId: req.user.id, threadId: thread.id },
        });

        res.status(201).json({ message: `Joined /${thread.slug}` });
    } catch (err) {
        console.error('POST /api/threads/:slug/join error:', err);
        res.status(500).json({ error: 'Failed to join thread' });
    }
});

// ─── Get projects in a thread ───────────────────────────

router.get('/:slug/projects', async (req, res) => {
    try {
        const thread = await prisma.thread.findUnique({
            where: { slug: req.params.slug },
        });

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        const projects = await prisma.project.findMany({
            where: { threadId: thread.id },
            include: {
                author: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                applications: {
                    where: { status: 'accepted' },
                    select: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const result = projects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            skills: p.skills,
            dept: p.dept,
            year: p.year,
            githubUrl: p.githubUrl,
            githubUrl: p.githubUrl,
            author: p.author,
            team: p.applications.map((a) => a.user),
            applicationCount: p._count.applications,
            createdAt: p.createdAt,
        }));

        res.json({ projects: result });
    } catch (err) {
        console.error('GET /api/threads/:slug/projects error:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// ─── Leave a thread (auth required) ─────────────────────

router.delete('/:slug/leave', requireAuth, async (req, res) => {
    try {
        const thread = await prisma.thread.findUnique({
            where: { slug: req.params.slug },
        });

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        const membership = await prisma.threadMember.findUnique({
            where: { userId_threadId: { userId: req.user.id, threadId: thread.id } },
        });

        if (!membership) {
            return res.status(404).json({ error: 'You are not a member of this thread' });
        }

        await prisma.threadMember.delete({
            where: { id: membership.id },
        });

        // Auto-delete user-created threads that become empty
        if (thread.creatorId) {
            const remainingMembers = await prisma.threadMember.count({
                where: { threadId: thread.id },
            });
            if (remainingMembers === 0) {
                await prisma.thread.delete({ where: { id: thread.id } });
            }
        }

        res.json({ message: `Left /${thread.slug}` });
    } catch (err) {
        console.error('DELETE /api/threads/:slug/leave error:', err);
        res.status(500).json({ error: 'Failed to leave thread' });
    }
});

// ─── Delete a thread (creator only) ─────────────────────

router.delete('/:slug', requireAuth, async (req, res) => {
    try {
        const thread = await prisma.thread.findUnique({
            where: { slug: req.params.slug },
        });

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        if (thread.creatorId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete threads you created' });
        }

        await prisma.thread.delete({
            where: { id: thread.id },
        });

        res.json({ message: `Deleted /${thread.slug}` });
    } catch (err) {
        console.error('DELETE /api/threads/:slug error:', err);
        res.status(500).json({ error: 'Failed to delete thread' });
    }
});

export default router;
