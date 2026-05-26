const express = require('express');
const {
	profileDetails,
	getProfileById,
	updateProfile,
	updatePreferences,
	updateImages
} = require('../controllers/user.controller');
const { verifyToken, adminChecks } = require('../middlewares/Auth.middleware');
const { uploadImagesMiddleware } = require('../middlewares/upload.middleware');

const router = express.Router();

// Current user profile
router.get('/profile', verifyToken, profileDetails);

// Public profile by id (admin only)
router.get('/profile/:id', verifyToken, adminChecks, getProfileById);

// Update basic profile info (protected)
router.patch('/profile/update', verifyToken, updateProfile);

// Update preferences (protected)
router.patch('/profile/preferences', verifyToken, updatePreferences);

// Upload profile and cover images (protected)
router.patch('/profile/images', verifyToken, uploadImagesMiddleware, updateImages);

module.exports = router;