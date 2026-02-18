import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Helper: handle OAuth callback ──────────────────────

function handleOAuthCallback(provider) {
    return (req, res) => {
        const token = generateToken(req.user.id);

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect to frontend with token as query param (so frontend can store it)
        res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}`);
    };
}

// ─── Google OAuth ───────────────────────────────────────

router.get('/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(501).json({ error: 'Google OAuth not configured' });
    }
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}?auth_error=google_failed` }),
    handleOAuthCallback('google')
);

// ─── GitHub OAuth ───────────────────────────────────────

router.get('/github', (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID) {
        return res.status(501).json({ error: 'GitHub OAuth not configured' });
    }
    passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}?auth_error=github_failed` }),
    handleOAuthCallback('github')
);

// ─── Get Current User ───────────────────────────────────

router.get('/me', async (req, res) => {
    const token =
        req.cookies?.token ||
        req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
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
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// ─── Logout ─────────────────────────────────────────────

router.post('/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

export default router;
