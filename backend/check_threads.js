
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkThreads() {
    try {
        const threads = await prisma.thread.findMany();
        console.log('Thread count:', threads.length);
        console.log('Threads:', threads);
    } catch (error) {
        console.error('Error fetching threads:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkThreads();
