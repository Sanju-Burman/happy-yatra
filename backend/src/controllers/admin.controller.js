const Destination = require('../models/destination.model');
const User = require('../models/user.model');
const Survey = require('../models/surveyData.model');
const ErrorResponse = require('../utils/ErrorResponse');

// ─── DESTINATIONS ────────────────────────────────────────────

// GET /api/admin/destinations?page=1&limit=20
const listDestinations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [destinations, total] = await Promise.all([
      Destination.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Destination.countDocuments()
    ]);

    res.json({ destinations, total, page, limit });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/destinations
const createDestination = async (req, res, next) => {
  try {
    const { name, imageUrl, averageCost, styles, tags,
            activities, location, latitude, longitude, trending } = req.body;
    const destination = await Destination.create({
      name, imageUrl, averageCost, styles, tags,
      activities, location, latitude, longitude,
      trending: trending ?? false
    });
    res.status(201).json(destination);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/destinations/:id
const updateDestination = async (req, res, next) => {
  try {
    const allowed = ['name','imageUrl','averageCost','styles','tags',
                     'activities','location','latitude','longitude','trending', 'description'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const destination = await Destination.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    );
    if (!destination) return next(new ErrorResponse('Destination not found', 404));
    res.json(destination);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/destinations/:id
const deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return next(new ErrorResponse('Destination not found', 404));
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/destinations/:id/trending
const toggleTrending = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return next(new ErrorResponse('Destination not found', 404));
    destination.trending = !destination.trending;
    await destination.save();
    res.json({ id: destination._id, trending: destination.trending });
  } catch (error) {
    next(error);
  }
};

// ─── USERS ───────────────────────────────────────────────────

// GET /api/admin/users?page=1&limit=20
const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    res.json({ users, total, page, limit });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users/:id/survey
const getUserSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ user: req.params.id });
    if (!survey) return next(new ErrorResponse('No survey found', 404));
    res.json(survey);
  } catch (error) {
    next(error);
  }
};

// ─── ANALYTICS ───────────────────────────────────────────────

// GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDestinations,
      totalSurveys,
      topDestinations,
      trendingCount,
      signupsByDay,
      surveyInterests,
      surveyBudgets
    ] = await Promise.all([

      User.countDocuments(),
      Destination.countDocuments(),
      Survey.countDocuments(),

      // Top 5 most viewed destinations
      Destination.find().sort({ viewCount: -1 }).limit(5)
        .select('name viewCount trending'),

      // How many destinations are trending
      Destination.countDocuments({ trending: true }),

      // Signups per day — last 30 days
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),

      // Most common survey interests
      Survey.aggregate([
        { $unwind: '$interests' },
        { $group: { _id: '$interests', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),

      // Budget distribution
      Survey.aggregate([
        { $group: { _id: '$travelStyle', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const surveyCompletionRate = totalUsers > 0
      ? ((totalSurveys / totalUsers) * 100).toFixed(1)
      : 0;

    res.json({
      totals: { users: totalUsers, destinations: totalDestinations,
                surveys: totalSurveys, trending: trendingCount },
      surveyCompletionRate,
      topDestinations,
      signupsByDay,
      surveyInterests,
      surveyBudgets
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  toggleTrending,
  listUsers,
  getUserSurvey,
  getAnalytics
};
