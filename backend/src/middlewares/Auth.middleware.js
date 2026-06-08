const jwt = require('jsonwebtoken');
const { isBlacklistedToken } = require('../lib/cache');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) return res.status(401).json({ error: "Access denied, token required" });

    try {
        if (isBlacklistedToken(token)) {
            return res.status(401).json({ message: 'blacklisted token' });
        }

        jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token expired' });
                }
                return res.status(401).json({ message: 'Invalid token in verifying' });
            }
            req.user = {
                id: decoded.sub,
                role: decoded.role
            };
            next();
        });
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
}
const adminChecks = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};
module.exports = { verifyToken,adminChecks };