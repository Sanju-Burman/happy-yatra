const mongoose = require('mongoose');
const User = require('../models/user.model');
const Destination = require('../models/destination.model');
const ErrorResponse = require('../utils/ErrorResponse');

const getSavedDestinations = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('savedDestinations')
            .lean();

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        const saved = user.savedDestinations || [];
        res.json({ success: true, count: saved.length, data: saved });
    } catch (error) {
        next(error);
    }
};

const saveDestination = async (req, res, next) => {
    try {
        const destinationId = req.params.id;

        // Verify destination exists
        const destination = await Destination.findById(destinationId).lean();
        if (!destination) {
            return next(new ErrorResponse('Destination not found', 404));
        }

        // Add to saved list (no duplicates via $addToSet)
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { savedDestinations: destinationId } },
            { new: true }
        );

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        res.json({ success: true, message: 'Destination saved successfully' });
    } catch (error) {
        next(error);
    }
};

const unsaveDestination = async (req, res, next) => {
    try {
        const destinationId = req.params.id;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { savedDestinations: destinationId } },
            { new: true }
        );

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        res.json({ success: true, message: 'Destination removed from saved' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSavedDestinations, saveDestination, unsaveDestination };
