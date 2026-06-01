const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= this.startDate;
            },
            message: 'End date must be on or after start date'
        }
    },
    status: {
        type: String,
        enum: ['planned', 'ongoing', 'completed', 'cancelled'],
        default: 'planned'
    },
    hotel: {
        type: String,
        trim: true,
        default: ''
    },
    transportType: {
        type: String,
        enum: ['flight', 'train', 'bus', 'car', 'bike', 'other'],
        default: 'other'
    },
    budget: {
        type: Number,
        min: 0,
        default: 0
    },
    images: {
        type: [String],
        default: []
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ userId: 1, startDate: -1 });

module.exports = mongoose.model('Trip', tripSchema);
