import prisma from '../lib/prisma.js';

export const createMeeting = async (req, res) => {
    const { id: projectId } = req.params;
    const { title, purpose, link, startTime, endTime } = req.body;
    const userId = req.user.id; // From authMiddleware

    try {
        // Check if user is project owner
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { authorId: true }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.authorId !== userId) {
            return res.status(403).json({ error: 'Only the project owner can schedule meetings' });
        }

        const meeting = await prisma.meeting.create({
            data: {
                title,
                purpose,
                link,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                projectId,
                createdById: userId
            }
        });

        res.status(201).json(meeting);
    } catch (error) {
        console.error('SERVER ERROR creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
};

export const getProjectMeetings = async (req, res) => {
    const { id: projectId } = req.params;

    try {
        const meetings = await prisma.meeting.findMany({
            where: { projectId },
            orderBy: { startTime: 'asc' },
            include: {
                createdBy: {
                    select: { name: true, avatarUrl: true }
                }
            }
        });

        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
};

export const deleteMeeting = async (req, res) => {
    const { meetingId: id } = req.params;
    const userId = req.user.id;

    try {
        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: { project: true }
        });

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        // Allow deletion if user is the creator OR the project owner
        if (meeting.createdById !== userId && meeting.project.authorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this meeting' });
        }

        await prisma.meeting.delete({
            where: { id }
        });

        res.json({ message: 'Meeting cancelled' });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
};
