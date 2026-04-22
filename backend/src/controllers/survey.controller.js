const mongoose = require('mongoose');
const Survey = require('../models/surveyData.model');
const ErrorResponse = require('../utils/ErrorResponse');

const submitSurvey = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(new ErrorResponse("Invalid user ID", 400));
        }

        const { travelStyle, budget, interests, activities } = req.body;

        await Survey.findOneAndUpdate(
            { user: userId },
            { user: userId, travelStyle, budget, interests, activities },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, message: "Survey submitted successfully" });
    } catch (error) {
        next(error);
    }
};

const getSurvey = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // User only sees their own surveys, Admin sees all
        const query = req.user.role === 'admin' ? {} : { user: userId };
        
        const surveys = await Survey.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: surveys.length, data: surveys });
    } catch (error) {
        next(error);
    }
};


module.exports = { submitSurvey, getSurvey };