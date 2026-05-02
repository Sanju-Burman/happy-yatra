const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/tokenBlocking.model');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    // console.log(token);
    if (!token) return res.status(401).json({ error: "Access denied, token require" });
    try {
        const blacklisted = await TokenBlacklist.findOne({ token });
        if (blacklisted) return res.status(401).json({ message: 'blacklisted token' });
        // console.log(blacklisted);

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