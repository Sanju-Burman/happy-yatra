const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
    return newUser;
};

const refresh = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh Token required');
    }

    const blacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (blacklisted) {
        throw new Error('Invalid token');
    }

    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, decoded) => {
            if (err) {
                return reject(new Error('Invalid refresh token'));
            }

            const accessToken = jwt.sign(
                { userId: decoded.userId, email: decoded.email },
                process.env.JWT_ACCESS_KEY,
                { expiresIn: '1d' }
            );

            resolve({ accessToken });
        });
    });
};

const blacklistTokens = async (accessToken, refreshToken) => {
    const accessTokenExp = jwt.decode(accessToken).exp;
    const refreshTokenExp = jwt.decode(refreshToken).exp;

    await TokenBlacklist.create([
        {
            token: accessToken,
            type: 'access',
            expiresAt: new Date(accessTokenExp * 1000)
        },
        {
            token: refreshToken,
            type: 'refresh',
            expiresAt: new Date(refreshTokenExp * 1000)
        }
    ]);
};

module.exports = {
    login,
    signup,
    refresh,
    blacklistTokens
};
