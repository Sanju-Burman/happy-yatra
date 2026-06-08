const express = require('express');
const { login, signup, refresh, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', (req, res) => {
    res.status(200).json("Home page running");
});

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidation,
  login
);

router.post('/logout',
  verifyToken,
  body('accessToken').notEmpty(),
  body('refreshToken').notEmpty(),
  handleValidation,
  logout
);

router.post('/signup',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  handleValidation,
  signup
);

router.post('/refresh',
  body('refresh_token').notEmpty(),
  handleValidation,
  refresh
);

router.post('/data',verifyToken, (req, res) => {
    res.json("protected page running");
});

router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  handleValidation,
  forgotPassword
);

router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
  handleValidation,
  resetPassword
);

module.exports = router;