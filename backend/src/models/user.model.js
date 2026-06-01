const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: { type: String, default: '' },
    location: { type: String },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    profilePicture: { type: String },
    profilePicture_public_id: { type: String },
    coverImage: { type: String },
    coverImage_public_id: { type: String },
    socialLinks: {
        type: {
            twitter: { type: String, default: '' },
            instagram: { type: String, default: '' },
            facebook: { type: String, default: '' },
            website: { type: String, default: '' }
        },
        default: {}
    },
    preferences: {
        budget: {
            type: String,
            enum: ['budget', 'moderate', 'luxury', ''],
            default: ''
        },
        travelStyle: {
            type: String,
            enum: ['solo', 'couple', 'family', 'group', ''],
            default: ''
        },
        interests: {
            type: [String],
            default: []
        }
    },
    aiProfile: {
        embeddings: { type: [Number], default: [] },
        lastAnalyzed: { type: Date, default: null },
        personalityTags: { type: [String], default: [] }
    },
    stats: {
        totalTrips: { type: Number, default: 0 },
        countriesVisited: { type: Number, default: 0 },
        experiencesShared: { type: Number, default: 0 }
    },
    savedDestinations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'destinations'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Users', userSchema);