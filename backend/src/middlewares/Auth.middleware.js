const jwt = require('jsonwebtoken');
const { isBlacklistedToken } = require('../lib/cache');

/**
 * verifyToken
 *
 * Express middleware that validates the JWT access token on every protected
 * request. Rejects with structured 401 responses for each distinct failure
 * mode so the frontend interceptor can distinguish them cleanly.
 *
 * Failure modes and their HTTP responses:
 *   - Missing token           → 401 { error: 'Access denied, token required' }
 *   - Blacklisted token       → 401 { message: 'Token has been revoked' }
 *   - Expired token           → 401 { message: 'Token expired', code: 'TOKEN_EXPIRED' }
 *   - Malformed/invalid token → 401 { message: 'Invalid token', code: 'TOKEN_INVALID' }
 *
 * The `code` field on expiry/invalid responses allows the Axios interceptor
 * to decide whether to attempt a silent refresh (TOKEN_EXPIRED) or bail out
 * immediately (TOKEN_INVALID).
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

    if (!token) {
        return res.status(401).json({ error: 'Access denied, token required' });
    }

    if (isBlacklistedToken(token)) {
        return res.status(401).json({ message: 'Token has been revoked' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token',
                code: 'TOKEN_INVALID',
            });
        }

        // Unexpected verification error (e.g. algorithm mismatch)
        return res.status(401).json({
            message: 'Token verification failed',
            code: 'TOKEN_ERROR',
        });
    }
};

/**
 * adminChecks
 *
 * Must be chained after verifyToken. Ensures the authenticated user has the
 * 'admin' role before allowing access to admin-only routes.
 */
const adminChecks = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};

module.exports = { verifyToken, adminChecks };