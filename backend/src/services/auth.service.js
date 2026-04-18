const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const TokenBlacklist = require('../models/tokenBlocking.model');

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error("Invalid email or password");
    }

    const payload = { userId: user._id, email: user.email };
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_KEY,
        { expiresIn: '1d' }
    );
    const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_KEY,
        { expiresIn: '7d' }
    );

    return { payload, accessToken, refreshToken };
};

const signup = async (username, email, password) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        username,
        email,
        password: hashPassword
    });
    await newUser.save();

    const payload = { userId: newUser._id, email: newUser.email };
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_KEY,
        { expiresIn: '1d' }
    );
    const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_KEY,
        { expiresIn: '7d' }
    );

    return { newUser, payload, accessToken, refreshToken };
};

const refresh = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh Token required');
    }

    const blacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (blacklisted) {
        throw new Error('Invalid token');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

        await TokenBlacklist.create({
            token: refreshToken,
            type: 'refresh',
            expiresAt: new Date(decoded.exp * 1000)
        });

        const newAccessToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '1d' }
        );

        const newRefreshToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '7d' }
        );

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
        throw new Error('Invalid refresh token');
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
        throw new Error('Failed to blacklist tokens: ' + error.message);
    }
};

module.exports = {
    login,
    signup,
    refresh,
    blacklistTokens
};
