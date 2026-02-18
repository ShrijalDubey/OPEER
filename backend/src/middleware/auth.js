import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

/**
 * Auth middleware — verifies JWT from cookie or Authorization header
 * and attaches `req.user` to the request.
 *
 * Usage:
 *   router.get('/protected', requireAuth, (req, res) => { ... })
 */
export function requireAuth(req, res, next) {
    // 1. Try cookie first, then Authorization header
    const token =
        req.cookies?.token ||
        req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Attach minimal user info from the token
        req.user = { id: payload.userId };
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Optional auth — same as requireAuth but doesn't block.
 * If a valid token is present, `req.user` is set; otherwise continues without it.
 */
export function optionalAuth(req, _res, next) {
    const token =
        req.cookies?.token ||
        req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: payload.userId };
        } catch {
            // Token invalid, just continue without user
        }
    }
    next();
}

/**
 * Generate a JWT for a user.
 */
export function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
