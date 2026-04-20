const User = require('../models/user.model');
const ErrorResponse = require('../utils/ErrorResponse');

const profileDetails = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return next(new ErrorResponse("Authentication required", 401));
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }
        res.status(200).json({ success: true, user });
    } catch (e) {
        next(e);
    }
}

module.exports = { profileDetails }