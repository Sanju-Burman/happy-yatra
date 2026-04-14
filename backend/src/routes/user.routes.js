const express = require('express');
const { profileDetails } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');
const router = express.Router();

router.get('/profile', verifyToken, profileDetails);

module.exports = router;