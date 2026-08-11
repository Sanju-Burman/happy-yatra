const crypto = require('crypto');
const Destination = require('../models/destination.model');
const AiRecommendation = require('../models/aiRecommendation.model');
const GeminiService = require('./gemini.service');

/**
 * Computes a unique hash for the user survey responses to identify changes.
 */
function computeSurveyHash(survey) {
    const { travelStyle, budget, interests = [], activities = [] } = survey;
    
    // Sort fields to ensure order independence in hash calculation
    const sortedInterests = [...interests].sort();
    const sortedActivities = [...activities].sort();

    const surveyString = JSON.stringify({
        travelStyle,
        budget,
        interests: sortedInterests,
        activities: sortedActivities
    });

    return crypto.createHash('sha256').update(surveyString).digest('hex');
}

/**
 * Generates AI-based recommendations and caches them in the database.
 * If a valid cache entry exists, returns it directly.
 * 
 * @param {string} userId - ID of the user requesting recommendations
 * @param {Object} survey - The user's survey data
 * @returns {Promise<{destinations: Array<Object>, fromCache: boolean}>}
 */
async function generateAndCacheRecommendations(userId, survey) {
    const surveyHash = computeSurveyHash(survey);

    // 1. Check for valid cached recommendation
    const cached = await AiRecommendation.findOne({ user: userId, surveyHash });
    if (cached) {
        // Hydrate from DB
        const destinations = await Destination.find({ _id: { $in: cached.destinationIds } }).lean();
        
        // Sort destinations to match the order returned by AI
        const destMap = new Map(destinations.map(d => [d._id.toString(), d]));
        const sortedDestinations = cached.destinationIds
            .map(id => destMap.get(id.toString()))
            .filter(Boolean);

        return {
            destinations: sortedDestinations,
            fromCache: true
        };
    }

    // 2. Cache miss: Request from Gemini
    const aiRecommendations = await GeminiService.getRecommendations(survey);

    const destinationIds = [];
    const savedDestinations = [];

    // 3. Compare and store/reuse
    for (const rec of aiRecommendations) {
        const normalizedName = rec.name.trim();
        const normalizedLocation = rec.location.trim();

        // Unique lookup by name and location (case-insensitive)
        let destination = await Destination.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i') },
            location: { $regex: new RegExp(`^${escapeRegex(normalizedLocation)}$`, 'i') }
        });

        if (!destination) {
            // Create a new destination record
            destination = await Destination.create({
                name: normalizedName,
                imageUrl: rec.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
                averageCost: rec.averageCost,
                styles: rec.styles,
                tags: rec.tags,
                activities: rec.activities,
                location: normalizedLocation,
                latitude: rec.latitude,
                longitude: rec.longitude,
                description: rec.description,
                trending: false
            });
        }

        destinationIds.push(destination._id);
        savedDestinations.push(destination);
    }

    // 4. Save to cache
    const ttlHours = parseInt(process.env.GEMINI_CACHE_TTL_HOURS || '24', 10);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await AiRecommendation.create({
        user: userId,
        surveyHash,
        destinationIds,
        rawResponse: aiRecommendations,
        expiresAt
    });

    return {
        destinations: savedDestinations,
        fromCache: false
    };
}

// Utility to escape regex special characters
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = {
    generateAndCacheRecommendations,
    computeSurveyHash
};
