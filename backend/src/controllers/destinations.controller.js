const Destination = require('../models/destination.model');
const mongoose = require('mongoose');

const getDestinations = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;

        const baseQuery = {};
        if (req.query.trending === 'true') {
            baseQuery.trending = true;
        }

        const [destinations, total] = await Promise.all([
            Destination.find(baseQuery).skip(skip).limit(limit),
            Destination.countDocuments(baseQuery)
        ]);

        res.json({
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
        console.error('[getDestinations] Failed to fetch destinations', {
            query: req.query,
            message: error.message
        });
        res.status(500).json({ message: 'Server Error on get Destinations' });
    }
};

const getDestinationById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid destination id format' });
        }

        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json(destination);
    } catch (error) {
        console.error('[getDestinationById] Failed to fetch destination', {
            id: req.params.id,
            message: error.message
        });
        res.status(500).json({ message: 'Server Error on get Destination by ID' });
    }
};

module.exports = { getDestinations, getDestinationById };
