// Simple in-memory store for failed attempts (reset on server restart)
export const adminLoginAttempts = {};

// Example structure:
// adminLoginAttempts[ip] = { count: 0, lastAttempt: Date, lockedUntil: Date|null }
