const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const surveyRoutes = require('./routes/survey.routes');
const recommendationRoutes = require('./routes/recom.routes');

const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors({
    origin: '*', // Allow all during debugging, recommend setting to frontend URL later
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("home");
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/destinations', recommendationRoutes);

module.exports = app;
