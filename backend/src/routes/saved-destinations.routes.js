const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { getSavedDestinations, saveDestination, unsaveDestination } = require('../controllers/saved.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    next();
};

router.get('/', verifyToken, getSavedDestinations);

router.post('/:id',
    verifyToken,
    param('id').isMongoId().withMessage('Invalid destination ID format'),
    handleValidation,
    saveDestination
);

router.delete('/:id',
    verifyToken,
    param('id').isMongoId().withMessage('Invalid destination ID format'),
    handleValidation,
    unsaveDestination
);

module.exports = router;
