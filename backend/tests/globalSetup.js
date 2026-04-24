const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {
    // Override env var to use test database
    process.env.MONGO_DB = process.env.MONGO_DB.replace(
        /\/[^/?]+(\?)/,
        '/DestinationRecommendations_test$1'
    );

    // Connect and drop the test database to start fresh
    await mongoose.connect(process.env.MONGO_DB);
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
};
