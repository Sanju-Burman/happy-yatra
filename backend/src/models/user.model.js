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
    bio: { type: String },
    location: { type: String },
    profilePicture: { type: String },
    profilePicture_public_id: { type: String },
    coverImage: { type: String },
    coverImage_public_id: { type: String },
    socialLinks: { type: Object },
    savedDestinations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'destinations'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Users', userSchema);