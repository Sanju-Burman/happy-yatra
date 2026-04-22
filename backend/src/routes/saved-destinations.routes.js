const express = require('express');
const router = express.Router();
const { getSavedDestinations, saveDestination, unsaveDestination } = require('../controllers/saved.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');

router.get('/', verifyToken, getSavedDestinations);
router.post('/:id', verifyToken, saveDestination);
router.delete('/:id', verifyToken, unsaveDestination);

module.exports = router;
