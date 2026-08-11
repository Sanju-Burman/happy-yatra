const mongoose = require('mongoose');

const AiRecommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    surveyHash: {
        type: String,
        required: true
    },
    destinationIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'destinations'
    }],
    rawResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Expire when this specific timestamp is reached
    }
}, { timestamps: true });

AiRecommendationSchema.index({ user: 1, surveyHash: 1 });

module.exports = mongoose.model('AiRecommendation', AiRecommendationSchema);
