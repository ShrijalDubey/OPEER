import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg-primary)]">
            {/* Orb 1 - Purple */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
                style={{
                    background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
                    top: '-10%',
                    left: '-10%',
                }}
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Orb 2 - Cyan */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-15"
                style={{
                    background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)',
                    bottom: '10%',
                    right: '-5%',
                }}
                animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            {/* Orb 3 - Blue (Center) */}
            <motion.div
                className="absolute w-[900px] h-[900px] rounded-full blur-[130px] opacity-10"
                style={{
                    background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                    top: '40%',
                    left: '30%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    x: [0, 50, 0],
                    y: [0, 50, 0],
                    opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
            />

            {/* Noise Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='0.4'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
