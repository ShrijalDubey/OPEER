import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../lib/prisma.js';

// ─── Helper: find or create user from OAuth profile ─────

async function findOrCreateUser(provider, profile) {
    const providerId = profile.id;
    const email =
        profile.emails?.[0]?.value ||
        `${provider}_${providerId}@opeer.placeholder`;
    const name = profile.displayName || profile.username || 'Anonymous';
    const avatarUrl =
        profile.photos?.[0]?.value || null;

    let user = await prisma.user.findUnique({
        where: { provider_providerId: { provider, providerId } },
    });

    if (!user) {
        // Check if email already taken by another provider
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            // Link this provider to the existing account
            user = await prisma.user.update({
                where: { email },
                data: { provider, providerId, avatarUrl: avatarUrl || existing.avatarUrl },
            });
        } else {
            user = await prisma.user.create({
                data: { email, name, avatarUrl, provider, providerId },
            });
        }
    }

    return user;
}

// ─── Google Strategy ────────────────────────────────────

export function configurePassport() {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: '/auth/google/callback',
                    scope: ['profile', 'email'],
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    try {
                        const user = await findOrCreateUser('google', profile);
                        done(null, user);
                    } catch (err) {
                        done(err, null);
                    }
                }
            )
        );
        console.log('  ✓ Google OAuth strategy registered');
    } else {
        console.log('  ⚠ Google OAuth not configured (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');
    }

    // ─── GitHub Strategy ────────────────────────────────────

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        passport.use(
            new GitHubStrategy(
                {
                    clientID: process.env.GITHUB_CLIENT_ID,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET,
                    callbackURL: '/auth/github/callback',
                    scope: ['user:email'],
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    try {
                        const user = await findOrCreateUser('github', profile);
                        done(null, user);
                    } catch (err) {
                        done(err, null);
                    }
                }
            )
        );
        console.log('  ✓ GitHub OAuth strategy registered');
    } else {
        console.log('  ⚠ GitHub OAuth not configured (missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)');
    }

    // Passport serialization (not used with JWT, but required by Passport)
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}
