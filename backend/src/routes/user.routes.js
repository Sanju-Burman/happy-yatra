const express = require('express');
const { profileDetails } = require('../controllers/user.controller');
const router = express.Router();

router.get('/profile/:email', profileDetails);

module.exports = router;