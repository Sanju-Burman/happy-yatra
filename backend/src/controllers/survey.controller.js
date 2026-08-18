const mongoose = require('mongoose');
const Survey = require('../models/surveyData.model');
const ErrorResponse = require('../utils/ErrorResponse');
const { generateAndCacheRecommendations } = require('../services/recommendationHelper');

const submitSurvey = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(new ErrorResponse("Invalid user ID", 400));
        }

        const { travelStyle, budget, interests, activities } = req.body;

        const survey = await Survey.findOneAndUpdate(
            { user: userId },
            { user: userId, travelStyle, budget, interests, activities },
            { upsert: true, new: true }
        ).lean();

        // Option B: Pre-generate and cache AI recommendations immediately
        try {
            await generateAndCacheRecommendations(userId, survey);
        } catch (aiError) {
            console.error('Failed to pre-cache AI recommendations on survey submit:', aiError);
            // We still proceed since the survey was successfully saved in the DB,
            // but we can log the warning. The recommendations page will retry.
        }

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