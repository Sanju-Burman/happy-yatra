const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const surveyRoutes = require('./routes/survey.routes');
const recommendationRoutes = require('./routes/recom.routes');

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
app.use('/api/destinations', recommendationRoutes);

app.use((error, req, res, next) => {
    const requestOrigin = req.headers.origin;
    const responseOrigin = allowAllOrigins
        ? '*'
        : (requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0] || '*');

    res.setHeader('Access-Control-Allow-Origin', responseOrigin);
    res.setHeader('Vary', 'Origin');
    res.status(error.statusCode || 500).json({
        message: error.message || 'Internal Server Error'
    });
});

module.exports = app;
