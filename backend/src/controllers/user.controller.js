const User = require('../models/user.model');

const profileDetails = async (req, res) => {
    console.log("Request Params:", req.params);
    console.log("Request URL:", req.url);
    const email = req.params.email;

    if (!email) {
        return res.status(400).json({
            message: "Email parameter is required"
        });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({ user });
    } catch (e) {
        console.error({ msg: "error", error: e });
        res.status(500).json({
            message: "Failed to fetch user details"
        });
    }
}

module.exports = { profileDetails }