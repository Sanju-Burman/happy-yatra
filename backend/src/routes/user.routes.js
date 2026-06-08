const express = require('express');
const {
	profileDetails,
	getProfileById,
	updateProfile,
	updatePreferences,
	updateImages,
	changePassword
} = require('../controllers/user.controller');
const { verifyToken, adminChecks } = require('../middlewares/Auth.middleware');
const { uploadImagesMiddleware } = require('../middlewares/upload.middleware');
const { body, validationResult } = require('express-validator');

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

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// Update password (protected)
router.patch('/profile/password',
  verifyToken,
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  handleValidation,
  changePassword
);

module.exports = router;