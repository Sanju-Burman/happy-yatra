const mongoose = require("mongoose");
require("dotenv").config();
const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        logger.debug("Using existing MongoDB connection");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_DB);
        isConnected = db.connections[0].readyState;
        logger.info("MongoDB Connected Successfully!");
    } catch (error) {
        logger.error(`MongoDB Connection Failed: ${error.message}`);
        // Do not throw error here, let the handler catch it if needed, 
        // or check connection status before DB operations
        isConnected = false;
        throw error;
    }
};

module.exports = connectDB;
