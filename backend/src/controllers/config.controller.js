const getConfig = async (req, res, next) => {
    try {
        res.json({
            success: true,
            appName: "Happy Yatra",
            version: "1.0.0",
            features: {
                survey: true,
                recommendations: true,
                bookmarks: true
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getConfig };
