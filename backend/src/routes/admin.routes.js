const express = require('express');
const { verifyToken, adminChecks } = require('../middlewares/Auth.middleware');
const {
  listDestinations, createDestination, updateDestination,
  deleteDestination, toggleTrending,
  listUsers, getUserSurvey,
  getAnalytics
} = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require valid JWT + admin role
router.use(verifyToken, adminChecks);

// Destinations
router.get('/destinations',              listDestinations);
router.post('/destinations',             createDestination);
router.put('/destinations/:id',          updateDestination);
router.delete('/destinations/:id',       deleteDestination);
router.patch('/destinations/:id/trending', toggleTrending);

// Users
router.get('/users',                     listUsers);
router.get('/users/:id/survey',          getUserSurvey);

// Analytics
router.get('/analytics',                 getAnalytics);

module.exports = router;
