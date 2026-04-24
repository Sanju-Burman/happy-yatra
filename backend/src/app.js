const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/error');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const surveyRoutes = require('./routes/survey.routes');
const destinationRoutes = require('./routes/destinations.routes');
const personalizedRecomRoutes = require('./routes/recommendations.routes');
const savedDestinationsRoutes = require('./routes/saved-destinations.routes');
const configRoutes = require('./routes/config.routes');

const connectDB = require('./config/db');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowAllOrigins = allowedOrigins.includes('*');

const corsOptions = {
    origin: (origin, callback) => {
        if (allowAllOrigins || !origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: !allowAllOrigins
};

// Database Connection Middleware
const ensureDBConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(503).json({
            message: "Service Unavailable: Database connection failed",
            error: error.message
        });
    }
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Sanitize data
app.use(mongoSanitize());

app.use(ensureDBConnection);

// Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: "Too many authentication attempts, please try again later"
});

// Routes
app.get("/", (req, res) => {
    res.send("home");
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/recommendations', personalizedRecomRoutes);
app.use('/api/saved-destinations', savedDestinationsRoutes);
app.use('/api/config', configRoutes);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
