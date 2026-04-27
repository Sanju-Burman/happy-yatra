const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const TokenBlacklist = require('../models/tokenBlocking.model');
const ErrorResponse = require('../utils/ErrorResponse');

const login = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ErrorResponse("Invalid email or password", 401);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new ErrorResponse("Invalid email or password", 401);
    }

    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_KEY,
        { expiresIn: '3h' }
    );
    const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_KEY,
        { expiresIn: '7d' }
    );

    return { payload, accessToken, refreshToken, role: user.role };
};

const signup = async (username, email, password) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ErrorResponse("User already exists", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        username,
        email,
        password: hashPassword
    });
    await newUser.save();

    return login(email, password);
};

const refresh = async (refreshToken) => {
    if (!refreshToken) {
        throw new ErrorResponse('Refresh Token required', 400);
    }

    const blacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (blacklisted) {
        throw new ErrorResponse('Invalid token', 401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

        await TokenBlacklist.create({
            token: refreshToken,
            type: 'refresh',
            expiresAt: new Date(decoded.exp * 1000)
        });

        const newAccessToken = jwt.sign(
            { sub: decoded.sub, role: decoded.role },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '3h' }
        );

        const newRefreshToken = jwt.sign(
            { sub: decoded.sub, role: decoded.role },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '7d' }
        );

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
        throw new ErrorResponse('Invalid refresh token', 401);
    }
};

const blacklistTokens = async (accessToken, refreshToken) => {
    try {
        const decodedAccess = jwt.decode(accessToken);
        const decodedRefresh = jwt.decode(refreshToken);
        
        const tokensToBlacklist = [];
        
        if (decodedAccess && decodedAccess.exp) {
            tokensToBlacklist.push({
                token: accessToken,
                type: 'access',
                expiresAt: new Date(decodedAccess.exp * 1000)
            });
        }
        
        if (decodedRefresh && decodedRefresh.exp) {
            tokensToBlacklist.push({
                token: refreshToken,
                type: 'refresh',
                expiresAt: new Date(decodedRefresh.exp * 1000)
            });
        }
        
        if (tokensToBlacklist.length > 0) {
            await TokenBlacklist.insertMany(tokensToBlacklist);
        }
    } catch (error) {
        throw new ErrorResponse('Failed to blacklist tokens: ' + error.message, 500);
    }
};

module.exports = {
    login,
    signup,
    refresh,
    blacklistTokens
};
