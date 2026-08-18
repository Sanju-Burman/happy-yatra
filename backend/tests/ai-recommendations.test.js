const supertest = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const geminiService = require('../src/services/gemini.service');
const Destination = require('../src/models/destination.model');

const request = supertest(app);

const testUser = {
    name: 'AI Rec Test User',
    email: 'airectest@happy-yatra.com',
    password: 'TestPass123!'
};

let accessToken;

// Predefined 10 destinations to return from the mock
const mockAiDestinations = [
    {
        name: "Kyoto",
        location: "Japan",
        latitude: 35.0116,
        longitude: 135.7681,
        averageCost: 150,
        styles: ["Solo", "Culture"],
        tags: ["Culture", "History"],
        activities: ["Temple tour", "Tea ceremony"],
        description: "Kyoto offers rich culture and beautiful traditional gardens."
    },
    {
        name: "Swiss Alps",
        location: "Switzerland",
        latitude: 46.8182,
        longitude: 8.2275,
        averageCost: 250,
        styles: ["Adventure", "Nature"],
        tags: ["Nature", "Hiking"],
        activities: ["Skiing", "Hiking"],
        description: "Breathtaking landscapes and winter activities."
    },
    {
        name: "Goa",
        location: "India",
        latitude: 15.2993,
        longitude: 74.1240,
        averageCost: 50,
        styles: ["Group", "Nature"],
        tags: ["Beach", "Nature"],
        activities: ["Swimming", "Sunset watching"],
        description: "A popular tropical beach destination."
    },
    {
        name: "Bali",
        location: "Indonesia",
        latitude: -8.4095,
        longitude: 115.1889,
        averageCost: 80,
        styles: ["Solo", "Nature"],
        tags: ["Beach", "Culture"],
        activities: ["Surfing", "Yoga"],
        description: "Rich spiritual heritage and stunning beaches."
    },
    {
        name: "Reykjavik",
        location: "Iceland",
        latitude: 64.1466,
        longitude: -21.9426,
        averageCost: 180,
        styles: ["Solo", "Nature"],
        tags: ["Nature", "Northern Lights"],
        activities: ["Northern Lights hunting", "Hot spring bathing"],
        description: "Charming Capital city and gate to Iceland's natural wonders."
    },
    {
        name: "Machu Picchu",
        location: "Peru",
        latitude: -13.1631,
        longitude: -72.5450,
        averageCost: 120,
        styles: ["Adventure", "Culture"],
        tags: ["History", "Hiking"],
        activities: ["Hiking", "Ancient ruin tour"],
        description: "Stunning Incan citadel set high in the Andes Mountains."
    },
    {
        name: "Queenstown",
        location: "New Zealand",
        latitude: -45.0312,
        longitude: 168.6626,
        averageCost: 200,
        styles: ["Adventure", "Nature"],
        tags: ["Nature", "Sports"],
        activities: ["Bungee jumping", "Jet boating"],
        description: "Adventure capital of the world with stunning scenery."
    },
    {
        name: "Rome",
        location: "Italy",
        latitude: 41.9028,
        longitude: 12.4964,
        averageCost: 140,
        styles: ["Solo", "Culture"],
        tags: ["History", "Culture"],
        activities: ["Historic walking tours", "Colosseum visit"],
        description: "Ancient ruins, magnificent art and culinary wonders."
    },
    {
        name: "Tokyo",
        location: "Japan",
        latitude: 35.6762,
        longitude: 139.6503,
        averageCost: 170,
        styles: ["Solo", "Culture"],
        tags: ["City", "Technology"],
        activities: ["Shopping", "Anime town exploration"],
        description: "A neon-lit megalopolis blending futuristic tech with ancient traditions."
    },
    {
        name: "Cairo",
        location: "Egypt",
        latitude: 30.0444,
        longitude: 31.2357,
        averageCost: 60,
        styles: ["Adventure", "Culture"],
        tags: ["History", "Culture"],
        activities: ["Pyramids tour", "Nile cruise"],
        description: "Ancient Egyptian heritage, bustling markets, and historical treasures."
    }
];

beforeAll(async () => {
    await connect();

    // Clean any prior state in test DB
    await clearDatabase();

    // Create test user and obtain auth token
    const signupRes = await request
        .post('/api/auth/signup')
        .send(testUser);
    accessToken = signupRes.body.access_token;

    // Seed one destination that already exists to test deduplication / reuse
    await Destination.create({
        name: "Kyoto",
        location: "Japan",
        latitude: 35.0116,
        longitude: 135.7681,
        averageCost: 150,
        styles: ["Solo", "Culture"],
        tags: ["Culture", "History"],
        activities: ["Temple tour", "Tea ceremony"],
        imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop",
        description: "Existing Kyoto destination in the database."
    });

    // Seed another unrelated destination to test additionalRecommendations
    await Destination.create({
        name: "Paris",
        location: "France",
        latitude: 48.8566,
        longitude: 2.3522,
        averageCost: 120,
        styles: ["Solo"],
        tags: ["Culture"],
        activities: ["Dining"],
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop",
        description: "An unrelated destination."
    });
});

afterAll(async () => {
    await closeDatabase();
});

describe('AI Recommendations Endpoint', () => {
    let geminiSpy;

    beforeEach(() => {
        // Mock GeminiService recommendations response
        geminiSpy = jest.spyOn(geminiService, 'getRecommendations')
            .mockResolvedValue(mockAiDestinations);
    });

    afterEach(() => {
        geminiSpy.mockRestore();
    });

    it('should submit a survey and successfully fetch AI recommendations', async () => {
        // Submit survey (Option B will fire the caching flow, which might fail/succeed gracefully in tests)
        const surveyRes = await request
            .post('/api/survey')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                travelStyle: 'Solo',
                budget: 2,
                interests: ['Culture', 'History'],
                activities: ['Sightseeing']
            });

        expect(surveyRes.status).toBe(201);

        // Request AI recommendations
        const res = await request
            .get('/api/recommendations/ai')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.aiRecommendations).toHaveLength(10);
        expect(res.body.fromCache).toBe(true);

        // Verify Kyoto was matched and not duplicated (1 Kyoto in total)
        const kyotoDests = await Destination.find({ name: 'Kyoto' });
        expect(kyotoDests).toHaveLength(1);
        expect(kyotoDests[0].description).toBe("Existing Kyoto destination in the database."); // original description preserved

        // Verify other 9 new destinations were created
        const totalDestsCount = await Destination.countDocuments();
        expect(totalDestsCount).toBe(11); // 1 existing Kyoto, 1 existing Paris, 9 newly created destinations

        // Verify additional recommendations returns Paris (excluding the AI ones)
        expect(res.body.additionalRecommendations.length).toBeGreaterThan(0);
        const additionalNames = res.body.additionalRecommendations.map(d => d.name);
        expect(additionalNames).toContain('Paris');
        expect(additionalNames).not.toContain('Kyoto');
    });

    it('should return recommendations from cache on subsequent calls', async () => {
        // Second call should hit caching layer
        const res = await request
            .get('/api/recommendations/ai')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.aiRecommendations).toHaveLength(10);
        expect(res.body.fromCache).toBe(true);

        // Verify Gemini API was NOT called this time
        expect(geminiSpy).not.toHaveBeenCalled();
    });

    it('should reject requests without authentication', async () => {
        const res = await request.get('/api/recommendations/ai');
        expect(res.status).toBe(401);
    });
});
