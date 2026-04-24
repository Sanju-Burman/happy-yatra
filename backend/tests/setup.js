const mongoose = require('mongoose');
require('dotenv').config();

let connected = false;

/**
 * Connect to a separate test database on the same Atlas cluster.
 * Replaces the MONGO_DB env var so the app's ensureDBConnection
 * middleware uses the test database as well.
 */
const connect = async () => {
    // Set required env vars for auth service if not already set
    if (!process.env.JWT_ACCESS_KEY) process.env.JWT_ACCESS_KEY = 'test-access-secret-key';
    if (!process.env.JWT_REFRESH_KEY) process.env.JWT_REFRESH_KEY = 'test-refresh-secret-key';

    if (!connected) {
        // Override the env var so app.js's ensureDBConnection middleware
        // connects to the test database instead of production
        process.env.MONGO_DB = process.env.MONGO_DB.replace(
            /\/[^/?]+(\?)/,
            '/DestinationRecommendations_test$1'
        );
        connected = true;
    }

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_DB);
    }
};

/**
 * Clear all test data and close the connection.
 */
const closeDatabase = async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
};

/**
 * Remove all data from every collection.
 */
const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

module.exports = { connect, closeDatabase, clearDatabase };
