const User = require('../models/user.model');
const Survey = require('../models/surveyData.model');
const ErrorResponse = require('../utils/ErrorResponse');
const { destroy } = require('../utils/cloudinary');

const profileDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select('username email role bio location profilePicture coverImage socialLinks')
            .lean();

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        const survey = await Survey.findOne({ user: req.user.id }).sort({ createdAt: -1 }).lean();

        res.status(200).json({
            success: true,
            user,
            preferences: survey || null
        });
    } catch (e) {
        next(e);
    }
}

const getProfileById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select('username bio location profilePicture coverImage socialLinks')
            .lean();

        if (!user) return next(new ErrorResponse('User not found', 404));

        const survey = await Survey.findOne({ user: id }).sort({ createdAt: -1 }).lean();

        // derived stats placeholder (expand as needed)
        const stats = {
            surveysCompleted: survey ? 1 : 0
        };

        res.status(200).json({ success: true, user, preferences: survey || null, stats });
    } catch (e) {
        next(e);
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const allowed = ['bio', 'location', 'socialLinks'];
        const body = req.body || {};
        const updates = {};
        for (const key of allowed) {
            if (body[key] !== undefined) updates[key] = body[key];
        }
        if (Object.keys(updates).length === 0) {
            return next(new ErrorResponse('No valid fields provided', 400));
        }

        const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true })
            .select('username bio location profilePicture coverImage socialLinks')
            .lean();

        res.status(200).json({ success: true, user });
    } catch (e) {
        next(e);
    }
}

const updatePreferences = async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload || typeof payload !== 'object') {
            return next(new ErrorResponse('Invalid preferences payload', 400));
        }

        // Store preferences as a new survey/preference entry
        const doc = new Survey({ user: req.user.id, ...payload });
        await doc.save();

        res.status(200).json({ success: true, preferences: doc });
    } catch (e) {
        next(e);
    }
}

const updateImages = async (req, res, next) => {
    try {
        // middleware should populate req.uploadedImages
        const uploaded = req.uploadedImages || {};
        const updates = {};

        if (uploaded.profilePicture) {
            updates.profilePicture = uploaded.profilePicture.url;
            updates.profilePicture_public_id = uploaded.profilePicture.public_id;
        }
        if (uploaded.coverImage) {
            updates.coverImage = uploaded.coverImage.url;
            updates.coverImage_public_id = uploaded.coverImage.public_id;
        }

        if (Object.keys(updates).length === 0) {
            return next(new ErrorResponse('No images uploaded', 400));
        }

        const existingUser = await User.findById(req.user.id)
            .select('profilePicture_public_id coverImage_public_id')
            .lean();

        if (!existingUser) {
            return next(new ErrorResponse('User not found', 404));
        }

        const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true })
            .select('username bio location profilePicture coverImage socialLinks')
            .lean();

        const deletePromises = [];
        if (
            uploaded.profilePicture &&
            existingUser.profilePicture_public_id &&
            existingUser.profilePicture_public_id !== uploaded.profilePicture.public_id
        ) {
            deletePromises.push(destroy(existingUser.profilePicture_public_id));
        }
        if (
            uploaded.coverImage &&
            existingUser.coverImage_public_id &&
            existingUser.coverImage_public_id !== uploaded.coverImage.public_id
        ) {
            deletePromises.push(destroy(existingUser.coverImage_public_id));
        }
        await Promise.all(deletePromises);

        res.status(200).json({ success: true, user });
    } catch (e) {
        next(e);
    }
}

module.exports = { profileDetails, getProfileById, updateProfile, updatePreferences, updateImages };
