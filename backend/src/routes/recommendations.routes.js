const express = require('express');
const router = express.Router();
const { getRecommendations, getAiRecommendations } = require('../controllers/recommendations.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');

router.get('/', verifyToken, getRecommendations);
router.get('/ai', verifyToken, getAiRecommendations);

module.exports = router;

