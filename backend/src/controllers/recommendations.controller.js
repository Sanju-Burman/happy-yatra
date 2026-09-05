const Destination = require('../models/destination.model');
const Survey = require('../models/surveyData.model');
const ErrorResponse = require('../utils/ErrorResponse');
const { generateAndCacheRecommendations } = require('../services/recommendationHelper');

const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Fetch user's latest survey
        const survey = await Survey.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
        
        if (!survey) {
            return next(new ErrorResponse("Please complete the survey first to get recommendations.", 400));
        }

        const { travelStyle, budget, interests, activities } = survey;

        // Build recommendation query
        const query = {
            $or: [
                { styles: { $in: [travelStyle] } },
                { tags: { $in: interests } }
            ]
        };

        // Strict Budget filtering (optional)
        let recommended = [];
        if (budget) {
            let costLimit = 5000;
            if (budget === 1) costLimit = 2000;
            else if (budget === 2) costLimit = 5000;
            else if (budget === 3) costLimit = 10000;
            
            if (budget < 4) {
                recommended = await Destination.find({ ...query, averageCost: { $lte: costLimit } }).limit(10).lean();
            } else {
                recommended = await Destination.find(query).limit(10).lean();
            }
        }

        // If no matches found with strict budget, loosen to just style/tags
        if (recommended.length === 0) {
            recommended = await Destination.find(query).limit(10).lean();
        }

        // If still no matches, just return any 10 destinations
        if (recommended.length === 0) {
            recommended = await Destination.find().limit(10).lean();
        }

        res.json({ success: true, count: recommended.length, data: recommended });
    } catch (error) {
        next(error);
    }
};

const getAiRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch user's latest survey
        const survey = await Survey.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
        if (!survey) {
            return next(new ErrorResponse("Please complete the survey first to get recommendations.", 400));
        }

        // Generate or get cached AI recommendations
        const { destinations: aiDestinations, fromCache } = await generateAndCacheRecommendations(userId, survey);

        // Fetch additional matching destinations excluding the AI recommendations
        const aiDestIds = aiDestinations.map(d => d._id);
        const { travelStyle, budget, interests } = survey;

        const query = {
            _id: { $nin: aiDestIds },
            $or: [
                { styles: { $in: [travelStyle] } },
                { tags: { $in: interests } }
            ]
        };

        let additional = [];
        if (budget) {
            let costLimit = 5000;
            if (budget === 1) costLimit = 2000;
            else if (budget === 2) costLimit = 5000;
            else if (budget === 3) costLimit = 10000;

            if (budget < 4) {
                additional = await Destination.find({ ...query, averageCost: { $lte: costLimit } }).limit(10).lean();
            } else {
                additional = await Destination.find(query).limit(10).lean();
            }
        }

        if (additional.length === 0) {
            additional = await Destination.find(query).limit(10).lean();
        }

        if (additional.length === 0) {
            additional = await Destination.find({ _id: { $nin: aiDestIds } }).limit(10).lean();
        }

        res.json({
            success: true,
            aiRecommendations: aiDestinations,
            additionalRecommendations: additional,
            fromCache
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getRecommendations, getAiRecommendations };

