const Destination = require('../models/destination.model');

const getDestinations = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;

        const baseQuery = {};
        if (req.query.trending === 'true') {
            baseQuery.trending = true;
        }

        const destinations = await Destination.find(baseQuery).skip(skip).limit(limit);
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error on get Destinations' });
    }
};

const getDestinationById = async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json(destination);
    } catch (error) {
        res.status(500).json({ message: 'Server Error on get Destination by ID' });
    }
};

module.exports = { getDestinations, getDestinationById };
