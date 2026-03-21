import 'dotenv/config';
import { generateProjectEnhancement } from './src/lib/ai.js';

async function test() {
    console.log('Testing enhance...');
    try {
        const res = await generateProjectEnhancement('A hardware robot that cleans the college library');
        console.log('Success:', res);
    } catch (e) {
        console.error('Error caught in test:', e);
    }
}

test();
