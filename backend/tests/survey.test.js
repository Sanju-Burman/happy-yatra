const supertest = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

const request = supertest(app);

const testUser = {
    name: 'Survey Test User',
    email: 'surveytest@happy-yatra.com',
    password: 'TestPass123!'
};

let accessToken;

beforeAll(async () => {
    await connect();

    // Create a test user and get tokens
    const signupRes = await request
        .post('/api/auth/signup')
        .send(testUser);
    accessToken = signupRes.body.access_token;
});

afterAll(async () => {
    await closeDatabase();
});

describe('Survey Endpoints', () => {

    describe('POST /api/survey', () => {
        it('should submit a valid survey', async () => {
            const res = await request
                .post('/api/survey')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    travelStyle: 'Solo',
                    budget: 2,
                    interests: ['Beach', 'Nature'],
                    activities: ['Asia', 'Europe']
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should reject survey with missing travelStyle', async () => {
            const res = await request
                .post('/api/survey')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    budget: 2,
                    interests: ['Beach'],
                    activities: ['Asia']
                });

            expect(res.status).toBe(400);
        });

        it('should reject survey with non-numeric budget', async () => {
            const res = await request
                .post('/api/survey')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    travelStyle: 'Solo',
                    budget: 'expensive',
                    interests: ['Beach'],
                    activities: ['Asia']
                });

            expect(res.status).toBe(400);
        });

        it('should reject survey with empty interests array', async () => {
            const res = await request
                .post('/api/survey')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    travelStyle: 'Solo',
                    budget: 2,
                    interests: [],
                    activities: ['Asia']
                });

            expect(res.status).toBe(400);
        });

        it('should reject survey without auth token', async () => {
            const res = await request
                .post('/api/survey')
                .send({
                    travelStyle: 'Solo',
                    budget: 2,
                    interests: ['Beach'],
                    activities: ['Asia']
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/survey', () => {
        it('should retrieve the submitted survey', async () => {
            const res = await request
                .get('/api/survey')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].travelStyle).toBe('Solo');
        });

        it('should reject GET without auth token', async () => {
            const res = await request.get('/api/survey');

            expect(res.status).toBe(401);
        });
    });
});
