/**
 * Migration Script: migrate_profiles.js
 *
 * Migrates existing users to the expanded profile schema:
 * - Sets default values for new fields (country, city, preferences, aiProfile, stats)
 * - Converts each savedDestination ObjectId into a Favorite document
 * - Merges latest Survey data into user.preferences when available
 *
 * Usage:
 *   node backend/scripts/migrate_profiles.js
 *
 * The script is idempotent — safe to run multiple times.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Survey = require('../src/models/surveyData.model');
const Favorite = require('../src/models/favorite.model');

const MONGO_URI = process.env.MONGO_DB;

async function migrate() {
    console.log('Connecting to MongoDB…');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.\n');

    const users = await User.find({}).select('+password').lean();
    console.log(`Found ${users.length} user(s) to migrate.\n`);

    let migratedCount = 0;
    let favoritesCreated = 0;
    let skippedCount = 0;

    for (const user of users) {
        const updates = {};
        let changed = false;

        // --- 1. Set defaults for new string fields ---
        if (user.country === undefined) {
            updates.country = '';
            changed = true;
        }
        if (user.city === undefined) {
            updates.city = '';
            changed = true;
        }
        if (user.bio === undefined) {
            updates.bio = '';
            changed = true;
        }

        // --- 2. Initialize preferences from Survey if not set ---
        if (!user.preferences || (!user.preferences.budget && !user.preferences.travelStyle)) {
            const survey = await Survey.findOne({ user: user._id })
                .sort({ createdAt: -1 })
                .lean();

            if (survey) {
                const budgetMap = {
                    // Map numeric budget ranges to labels
                };
                let budgetLabel = '';
                if (survey.budget !== undefined) {
                    if (survey.budget <= 5000) budgetLabel = 'budget';
                    else if (survey.budget <= 15000) budgetLabel = 'moderate';
                    else budgetLabel = 'luxury';
                }

                updates.preferences = {
                    budget: budgetLabel,
                    travelStyle: survey.travelStyle || '',
                    interests: survey.interests || []
                };
                changed = true;
            } else {
                // No survey data — set empty defaults
                updates.preferences = { budget: '', travelStyle: '', interests: [] };
                changed = true;
            }
        }

        // --- 3. Initialize aiProfile ---
        if (!user.aiProfile) {
            updates.aiProfile = {
                embeddings: [],
                lastAnalyzed: null,
                personalityTags: []
            };
            changed = true;
        }

        // --- 4. Initialize stats ---
        if (!user.stats) {
            updates.stats = {
                totalTrips: 0,
                countriesVisited: 0,
                experiencesShared: 0
            };
            changed = true;
        }

        // --- 5. Convert savedDestinations → Favorites ---
        if (user.savedDestinations && user.savedDestinations.length > 0) {
            for (const destId of user.savedDestinations) {
                try {
                    await Favorite.updateOne(
                        { userId: user._id, favoriteType: 'destination', itemId: destId },
                        { userId: user._id, favoriteType: 'destination', itemId: destId },
                        { upsert: true }
                    );
                    favoritesCreated++;
                } catch (err) {
                    // Duplicate key is fine (idempotent)
                    if (err.code !== 11000) {
                        console.error(`  ⚠ Error creating favorite for user ${user._id}:`, err.message);
                    }
                }
            }
        }

        // --- 6. Apply updates ---
        if (changed) {
            await User.updateOne({ _id: user._id }, { $set: updates });
            migratedCount++;
            console.log(`  ✓ Migrated user: ${user.username} (${user._id})`);
        } else {
            skippedCount++;
            console.log(`  – Skipped user: ${user.username} (already migrated)`);
        }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`  Users migrated:    ${migratedCount}`);
    console.log(`  Users skipped:     ${skippedCount}`);
    console.log(`  Favorites created: ${favoritesCreated}`);
    console.log('Done.\n');

    await mongoose.disconnect();
}

migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
