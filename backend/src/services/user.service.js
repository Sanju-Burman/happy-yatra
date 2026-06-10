const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/ErrorResponse');

const changePassword = async (userId, oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
        throw new ErrorResponse("Please provide old and new password", 400);
    }
    if (newPassword.length < 6) {
        throw new ErrorResponse("New password must be at least 6 characters", 400);
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new ErrorResponse("User not found", 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new ErrorResponse("Incorrect old password", 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return true;
};

module.exports = {
    changePassword
};
