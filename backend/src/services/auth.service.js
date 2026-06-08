const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const TokenBlacklist = require('../models/tokenBlocking.model');
const ErrorResponse = require('../utils/ErrorResponse');
const { setBlacklistedToken, isBlacklistedToken } = require('../lib/cache');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

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

    const blacklisted = isBlacklistedToken(refreshToken) || await TokenBlacklist.findOne({ token: refreshToken });
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
        setBlacklistedToken(refreshToken, decoded.exp - Math.floor(Date.now() / 1000));

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
            setBlacklistedToken(accessToken, decodedAccess.exp - Math.floor(Date.now() / 1000));
        }
        
        if (decodedRefresh && decodedRefresh.exp) {
            tokensToBlacklist.push({
                token: refreshToken,
                type: 'refresh',
                expiresAt: new Date(decodedRefresh.exp * 1000)
            });
            setBlacklistedToken(refreshToken, decodedRefresh.exp - Math.floor(Date.now() / 1000));
        }
        
        if (tokensToBlacklist.length > 0) {
            await TokenBlacklist.insertMany(tokensToBlacklist);
        }
    } catch (error) {
        throw new ErrorResponse('Failed to blacklist tokens: ' + error.message, 500);
    }
};

const forgotPassword = async (email) => {
    if (!email) {
        throw new ErrorResponse("Please provide an email address", 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorResponse("There is no user with that email", 404);
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash it and set to passwordResetToken field
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    // Expiry: 15 minutes
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please use the following link to reset your password (valid for 15 minutes):\n\n${resetUrl}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Token',
            text: message,
            html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password.</p><p>Please use the following link to reset your password (valid for 15 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        throw new ErrorResponse("Email could not be sent", 500);
    }

    return true;
};

const resetPassword = async (token, password) => {
    if (!token) {
        throw new ErrorResponse("Token is required", 400);
    }
    if (!password || password.length < 6) {
        throw new ErrorResponse("Password must be at least 6 characters", 400);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
        throw new ErrorResponse("Invalid or expired token", 400);
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return true;
};

module.exports = {
    login,
    signup,
    refresh,
    blacklistTokens,
    forgotPassword,
    resetPassword
};
