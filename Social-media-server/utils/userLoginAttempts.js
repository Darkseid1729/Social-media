// In-memory store for failed user login attempts (reset on server restart)
export const userLoginAttempts = {};

// Structure:
// userLoginAttempts[username] = { count: 0, lastAttempt: Date, lockedUntil: Date|null }
