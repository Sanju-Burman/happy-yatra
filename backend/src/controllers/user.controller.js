const User = require('../models/user.model');
const ErrorResponse = require('../utils/ErrorResponse');

const profileDetails = async (req, res, next) => {
    const email = req.user?.email;

    if (!email) {
        return next(new ErrorResponse("Email parameter is required", 400));
    }
    try {
        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }
        res.status(200).json({ success: true, user });
    } catch (e) {
        next(e);
    }
}

module.exports = { profileDetails }