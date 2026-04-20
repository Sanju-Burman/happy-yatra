const User = require('../models/user.model');
const ErrorResponse = require('../utils/ErrorResponse');

const profileDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select('username email role')
            .lean();

        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }
        res.status(200).json({ success: true, user });
    } catch (e) {
        next(e);
    }
}

module.exports = { profileDetails }