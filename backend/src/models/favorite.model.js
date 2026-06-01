const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    favoriteType: {
        type: String,
        enum: ['destination', 'experience', 'trip'],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

// Prevent duplicate favorites for the same user + type + item
favoriteSchema.index({ userId: 1, favoriteType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
