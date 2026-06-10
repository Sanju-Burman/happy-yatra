const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendations.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');

router.get('/', verifyToken, getRecommendations);

module.exports = router;
