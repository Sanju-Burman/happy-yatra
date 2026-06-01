const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    images: {
        type: [String],
        default: []
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    tags: {
        type: [String],
        default: []
    }
}, { timestamps: true });

experienceSchema.index({ userId: 1, tripId: 1 });
experienceSchema.index({ tags: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
