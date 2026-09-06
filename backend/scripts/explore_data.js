const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/user.model');
const Destination = require('../src/models/destination.model');
const Survey = require('../src/models/surveyData.model');

async function explore() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_DB);
        console.log('Connected!');

        console.log('\n--- Collections Check ---');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));

        console.log('\n--- Fetching Users ---');
        const users = await User.find().limit(5);
        console.log(`Found ${users.length} users (showing up to 5):`);
        console.log(JSON.stringify(users, null, 2));

        console.log('\n--- Fetching Destinations ---');
        const destinations = await Destination.find().limit(5);
        console.log(`Found ${destinations.length} destinations (showing up to 5):`);
        console.log(JSON.stringify(destinations, null, 2));

        console.log('\n--- Fetching Surveys ---');
        const surveys = await Survey.find().limit(5);
        console.log(`Found ${surveys.length} surveys (showing up to 5):`);
        console.log(JSON.stringify(surveys, null, 2));

    } catch (error) {
        console.error('Error exploring data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

explore();
