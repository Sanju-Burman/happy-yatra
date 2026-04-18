const Destination = require('../models/destination.model');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/ErrorResponse');

const getDestinations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;

        const baseQuery = {};
        if (req.query.trending === 'true') {
            baseQuery.trending = true;
        }

        const [destinations, total] = await Promise.all([
            Destination.find(baseQuery).skip(skip).limit(limit).lean(),
            Destination.countDocuments(baseQuery)
        ]);

        res.json({
            success: true,
            data: destinations,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

const getDestinationById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new ErrorResponse('Invalid destination id format', 400));
        }

        const destination = await Destination.findById(req.params.id).lean();
        if (!destination) {
            return next(new ErrorResponse('Destination not found', 404));
        }
        res.json({ success: true, data: destination });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDestinations, getDestinationById };
