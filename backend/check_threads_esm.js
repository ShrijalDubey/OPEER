
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkThreads() {
    try {
        const threads = await prisma.thread.findMany();
        console.log('Thread count:', threads.length);
        if (threads.length > 0) {
            console.log('First 3 threads:', threads.slice(0, 3));
        }
    } catch (error) {
        console.error('Error fetching threads:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkThreads();
