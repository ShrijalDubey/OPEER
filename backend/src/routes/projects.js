import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import * as meetingController from '../controllers/meetingController.js';

const router = Router();

// ─── Create a project (auth required) ───────────────────

router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, description, threadSlug, skills, dept, year, githubUrl } = req.body;

        if (!title || !description || !threadSlug) {
            return res.status(400).json({ error: 'title, description, and threadSlug are required' });
        }

        // Verify thread exists
        const thread = await prisma.thread.findUnique({
            where: { slug: threadSlug },
        });

        if (!thread) {
            return res.status(404).json({ error: `Thread /${threadSlug} not found` });
        }

        // Parse skills from comma-separated string or array
        const skillsArray = Array.isArray(skills)
            ? skills
            : typeof skills === 'string'
                ? skills.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

        const project = await prisma.project.create({
            data: {
                title,
                description,
                skills: skillsArray,
                dept: dept || null,
                year: year || null,
                githubUrl: githubUrl || null,
                goal: '',
                executionPlan: '',
                resources: '',
                threadId: thread.id,
                authorId: req.user.id,
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                thread: { select: { slug: true, name: true } },
            },
        });

        res.status(201).json({ project });
    } catch (err) {
        console.error('POST /api/projects error:', err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// ─── Meeting Routes (Moved to top to prevent shadowing) ──

router.post('/:id/meetings', requireAuth, meetingController.createMeeting);
router.get('/:id/meetings', requireAuth, meetingController.getProjectMeetings);
router.delete('/meetings/:meetingId', requireAuth, meetingController.deleteMeeting);

// ─── Get all projects (public) ──────────────────────────
// ─── Get all projects (public/personalized) ──────────────────────────
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { search, skills } = req.query;
        let where = {};

        // 1. If user is logged in, filter by joined threads
        if (req.user) {
            const memberships = await prisma.threadMember.findMany({
                where: { userId: req.user.id },
                select: { threadId: true }
            });
            const threadIds = memberships.map(m => m.threadId);
            where.threadId = { in: threadIds };
        }

        // 2. Search Filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { skills: { hasSome: [search] } },
                { tags: { hasSome: [search] } }
            ];
        }

        // 3. Skills Filter (comma separated)
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillList.length > 0) {
                // Determine if we want match ANY or ALL. 'hasSome' matches any.
                // User said "filter by skills too". Usually implies "contains these skills".
                // I'll use hasSome for now.
                // Note: If both search and skills are present, we need to be careful not to overwrite `where.skills`.
                // Actually, `where` structure in Prisma:
                // If I set `where.skills` for search, and `where.skills` for filter, they might conflict.
                // Better to use `AND`.
            }
        }

        // Let's restructure `where` to use AND for robust combination
        const andConditions = [];

        // Thread Filter
        if (req.user) {
            const memberships = await prisma.threadMember.findMany({
                where: { userId: req.user.id },
                select: { threadId: true }
            });
            const threadIds = memberships.map(m => m.threadId);
            andConditions.push({ threadId: { in: threadIds } });
        }

        // Search Filter
        if (search) {
            andConditions.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { skills: { hasSome: [search] } },
                    { tags: { hasSome: [search] } }
                ]
            });
        }

        // Skills Filter
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillList.length > 0) {
                andConditions.push({ skills: { hasSome: skillList } });
            }
        }

        if (andConditions.length > 0) {
            where = { AND: andConditions };
        }

        const projects = await prisma.project.findMany({
            where,
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                thread: { select: { name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' },
        });

        let result = projects;
        if (req.user) {
            const myApps = await prisma.application.findMany({
                where: {
                    userId: req.user.id,
                    projectId: { in: projects.map(p => p.id) }
                },
                select: { projectId: true, status: true }
            });
            const appMap = new Map(myApps.map(a => [a.projectId, a.status]));
            result = projects.map(p => ({
                ...p,
                myApplication: appMap.get(p.id) || null
            }));
        }

        res.json({ projects: result });
    } catch (err) {
        console.error('GET /api/projects error:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// ─── Get a single project ───────────────────────────────

router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true, email: true } },
                thread: { select: { slug: true, name: true } },
                applications: {
                    where: { status: 'accepted' },
                    select: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } }
                },
                _count: { select: { applications: true } },
            },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        let myApplication = null;
        if (req.user) {
            const app = await prisma.application.findUnique({
                where: {
                    userId_projectId: { userId: req.user.id, projectId: project.id }
                },
                select: { status: true }
            });
            myApplication = app?.status || null;
        }

        res.json({
            project: {
                ...project,
                applicationCount: project._count.applications,
                myApplication,
                _count: undefined,
            },
        });
    } catch (err) {
        console.error('GET /api/projects/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// ─── Apply to a project (auth required) ─────────────────

router.post('/:id/apply', requireAuth, async (req, res) => {
    try {
        const { message } = req.body;

        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Can't apply to your own project
        if (project.authorId === req.user.id) {
            return res.status(400).json({ error: "You can't apply to your own project" });
        }

        // Check for duplicate application
        const existing = await prisma.application.findUnique({
            where: {
                userId_projectId: { userId: req.user.id, projectId: project.id },
            },
        });

        if (existing) {
            return res.status(409).json({ error: 'You have already applied to this project' });
        }

        const application = await prisma.application.create({
            data: {
                message: message || null,
                projectId: project.id,
                userId: req.user.id,
            },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        // Notify owner
        await prisma.notification.create({
            data: {
                userId: project.authorId,
                type: 'info',
                message: `New application from ${req.user.name} for "${project.title}"`,
                link: `/projects/${project.id}/dashboard`
            }
        });

        res.status(201).json({ application });
    } catch (err) {
        console.error('POST /api/projects/:id/apply error:', err);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// ─── Delete a project (author only) ─────────────────────

// ─── Application Management ───────────────────────────

// Get applications for a project (Owner only)
router.get('/:id/applications', requireAuth, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                applications: {
                    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, skills: true, year: true, college: true, bio: true, githubUrl: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.authorId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        res.json({ applications: project.applications });
    } catch (err) {
        console.error('GET /api/projects/:id/applications error:', err);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Update application status (Accept/Reject)
// Update application status (Accept/Reject)
router.patch('/:id/applications/:appId', requireAuth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
        });

        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.authorId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const application = await prisma.application.update({
            where: { id: req.params.appId },
            data: { status },
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
        });

        // Notify applicant
        await prisma.notification.create({
            data: {
                userId: application.userId,
                type: status === 'accepted' ? 'success' : 'error',
                message: `Your application for "${project.title}" was ${status}`,
                link: status === 'accepted' ? `/projects/${project.id}/dashboard` : null
            }
        });

        res.json({ application });
    } catch (err) {
        console.error('PATCH /api/projects/:id/applications/:appId error:', err);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// ─── Leave a project (team member removes themselves) ───

router.delete('/:id/leave', requireAuth, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.authorId === req.user.id) return res.status(400).json({ error: 'Owner cannot leave their own project' });

        const application = await prisma.application.findFirst({
            where: { projectId: project.id, userId: req.user.id, status: 'accepted' }
        });
        if (!application) return res.status(404).json({ error: 'You are not a member of this project' });

        await prisma.application.delete({ where: { id: application.id } });

        // Notify the owner
        await prisma.notification.create({
            data: {
                userId: project.authorId,
                type: 'warning',
                message: `${req.user.name} left your project "${project.title}"`,
                link: `/projects/${project.id}/dashboard`
            }
        });

        res.json({ message: 'Left project successfully' });
    } catch (err) {
        console.error('DELETE /api/projects/:id/leave error:', err);
        res.status(500).json({ error: 'Failed to leave project' });
    }
});

// ─── Kick a member from project (owner only) ────────────

router.delete('/:id/members/:userId', requireAuth, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.authorId !== req.user.id) return res.status(403).json({ error: 'Only the owner can remove members' });
        if (req.params.userId === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });

        const application = await prisma.application.findFirst({
            where: { projectId: project.id, userId: req.params.userId, status: 'accepted' }
        });
        if (!application) return res.status(404).json({ error: 'Member not found' });

        await prisma.application.delete({ where: { id: application.id } });

        // Notify the kicked member
        await prisma.notification.create({
            data: {
                userId: req.params.userId,
                type: 'warning',
                message: `You were removed from "${project.title}"`,
                link: null
            }
        });

        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        console.error('DELETE /api/projects/:id/members/:userId error:', err);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

// ─── Project Dashboard (Update Info) ────────────────────

router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const { goal, executionPlan, resources, files } = req.body;

        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.authorId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const updated = await prisma.project.update({
            where: { id: project.id },
            data: {
                goal: goal !== undefined ? goal : project.goal,
                executionPlan: executionPlan !== undefined ? executionPlan : project.executionPlan,
                resources: resources !== undefined ? resources : project.resources,
                files: files !== undefined ? files : project.files,
            },
        });

        res.json({ project: updated });
    } catch (err) {
        console.error('PATCH /api/projects/:id error:', err);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// ─── Project Member & Task Routes ───────────────────────────────────────

router.get('/:id/chat', requireAuth, async (req, res) => {
    try {
        // Verify membership (Owner OR Team Member)
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { applications: { where: { status: 'accepted', userId: req.user.id } } },
        });

        if (!project) return res.status(404).json({ error: 'Project not found' });

        const isMember = project.authorId === req.user.id || project.applications.length > 0;
        if (!isMember) return res.status(403).json({ error: 'Not authorized' });

        const messages = await prisma.projectMessage.findMany({
            where: { projectId: project.id },
            include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' }, // Oldest first for chat history
            take: 100, // Limit to last 100
        });

        res.json({ messages });
    } catch (err) {
        console.error('GET /api/projects/:id/chat error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.post('/:id/chat', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

        // Verify membership
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { applications: { where: { status: 'accepted', userId: req.user.id } } },
        });

        if (!project) return res.status(404).json({ error: 'Project not found' });

        const isMember = project.authorId === req.user.id || project.applications.length > 0;
        if (!isMember) return res.status(403).json({ error: 'Not authorized' });

        const message = await prisma.projectMessage.create({
            data: {
                content,
                projectId: project.id,
                senderId: req.user.id,
            },
            include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        });

        res.status(201).json({ message });
    } catch (err) {
        console.error('POST /api/projects/:id/chat error:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ─── Kanban Tasks (Project Management) ──────────────────

// GET all tasks for a project
router.get('/:id/tasks', requireAuth, async (req, res) => {
    try {
        const tasks = await prisma.projectTask.findMany({
            where: { projectId: req.params.id },
            include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ tasks });
    } catch (err) {
        console.error('GET /api/projects/:id/tasks error:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// CREATE a new task
router.post('/:id/tasks', requireAuth, async (req, res) => {
    try {
        const { title, description, status, priority, assigneeId, dueDate } = req.body;

        // Verify Member Access
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { applications: { where: { status: 'accepted', userId: req.user.id } } }
        });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const isMember = project.authorId === req.user.id || project.applications.length > 0;
        if (!isMember) return res.status(403).json({ error: 'Not authorized' });

        const task = await prisma.projectTask.create({
            data: {
                title,
                description,
                status: status || 'todo',
                priority: priority || 'medium',
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId: project.id,
                assigneeId: assigneeId || null
            },
            include: { assignee: { select: { id: true, name: true, avatarUrl: true } } }
        });
        res.status(201).json({ task });
    } catch (err) {
        console.error('POST /api/projects/:id/tasks error:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// UPDATE a task (Move, Edit, Assign)
router.patch('/:id/tasks/:taskId', requireAuth, async (req, res) => {
    try {
        const { title, description, status, priority, assigneeId, dueDate } = req.body;

        const task = await prisma.projectTask.update({
            where: { id: req.params.taskId },
            data: {
                title, description, status, priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assigneeId
            },
            include: { assignee: { select: { id: true, name: true, avatarUrl: true } } }
        });
        res.json({ task });
    } catch (err) {
        console.error('PATCH /api/projects/:id/tasks/:taskId error:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE a task
router.delete('/:id/tasks/:taskId', requireAuth, async (req, res) => {
    try {
        await prisma.projectTask.delete({ where: { id: req.params.taskId } });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error('DELETE /api/projects/:id/tasks/:taskId error:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});


router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.authorId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own projects' });
        }

        await prisma.project.delete({
            where: { id: project.id },
        });

        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error('DELETE /api/projects/:id error:', err);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

export default router;
