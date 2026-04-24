const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Destination = require('../src/models/destination.model');
const { connect, closeDatabase, clearDatabase } = require('./setup');

const request = supertest(app);

const testUser = {
    name: 'Save Test User',
    email: 'savetest@happy-yatra.com',
    password: 'TestPass123!'
};

let accessToken;
let testDestinationId;

beforeAll(async () => {
    await connect();

    // Create a test user and get tokens
    const signupRes = await request
        .post('/api/auth/signup')
        .send(testUser);
    accessToken = signupRes.body.access_token;

    // Seed a test destination
    const destination = await Destination.create({
        name: 'Test Beach Resort',
        imageUrl: 'https://example.com/beach.jpg',
        averageCost: 3000,
        styles: ['Beach'],
        tags: ['Relaxation', 'Nature'],
        activities: ['Swimming', 'Sunbathing'],
        location: 'Goa, India',
        latitude: 15.2993,
        longitude: 74.124,
        trending: true,
        description: 'A beautiful beach resort for testing'
    });
    testDestinationId = destination._id.toString();
});

afterAll(async () => {
    await closeDatabase();
});

describe('Saved Destinations Endpoints', () => {

    describe('GET /api/saved-destinations', () => {
        it('should return empty saved list for new user', async () => {
            const res = await request
                .get('/api/saved-destinations')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(0);
            expect(res.body.data).toEqual([]);
        });

        it('should reject request without auth token', async () => {
            const res = await request.get('/api/saved-destinations');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/saved-destinations/:id', () => {
        it('should save a destination', async () => {
            const res = await request
                .post(`/api/saved-destinations/${testDestinationId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should appear in the saved list after saving', async () => {
            const res = await request
                .get('/api/saved-destinations')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.count).toBe(1);
            expect(res.body.data[0].name).toBe('Test Beach Resort');
        });

        it('should not duplicate when saving the same destination twice', async () => {
            await request
                .post(`/api/saved-destinations/${testDestinationId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            const res = await request
                .get('/api/saved-destinations')
                .set('Authorization', `Bearer ${accessToken}`);

            // Still only 1 saved destination, not 2
            expect(res.body.count).toBe(1);
        });

        it('should reject saving with invalid ObjectId', async () => {
            const res = await request
                .post('/api/saved-destinations/not-a-valid-id')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(400);
        });

        it('should reject saving a non-existent destination', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request
                .post(`/api/saved-destinations/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /api/saved-destinations/:id', () => {
        it('should unsave a destination', async () => {
            const res = await request
                .delete(`/api/saved-destinations/${testDestinationId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should have empty saved list after unsaving', async () => {
            const res = await request
                .get('/api/saved-destinations')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.body.count).toBe(0);
            expect(res.body.data).toEqual([]);
        });

        it('should reject unsave with invalid ObjectId', async () => {
            const res = await request
                .delete('/api/saved-destinations/invalid-id')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(400);
        });
    });
});
