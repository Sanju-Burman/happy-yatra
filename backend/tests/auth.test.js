const supertest = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

const request = supertest(app);

// Test user credentials
const testUser = {
    name: 'Test User',
    email: 'testuser@happy-yatra.com',
    password: 'TestPass123!'
};

let accessToken;
let refreshToken;

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

afterEach(async () => {
    // Don't clear between tests in this suite — tests are sequential
});

describe('Auth Endpoints', () => {

    describe('POST /api/auth/signup', () => {
        it('should register a new user and return tokens', async () => {
            const res = await request
                .post('/api/auth/signup')
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.access_token).toBeDefined();
            expect(res.body.refresh_token).toBeDefined();
            expect(res.body.user).toBeDefined();

            accessToken = res.body.access_token;
            refreshToken = res.body.refresh_token;
        });

        it('should reject signup with missing email', async () => {
            const res = await request
                .post('/api/auth/signup')
                .send({ name: 'No Email', password: 'Test123!' });

            expect(res.status).toBe(400);
        });

        it('should reject signup with short password', async () => {
            const res = await request
                .post('/api/auth/signup')
                .send({ name: 'Short Pass', email: 'short@test.com', password: '123' });

            expect(res.status).toBe(400);
        });

        it('should reject duplicate email signup', async () => {
            const res = await request
                .post('/api/auth/signup')
                .send(testUser);

            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.access_token).toBeDefined();
            expect(res.body.refresh_token).toBeDefined();

            // Store fresh tokens for later tests
            accessToken = res.body.access_token;
            refreshToken = res.body.refresh_token;
        });

        it('should reject login with wrong password', async () => {
            const res = await request
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'WrongPassword!' });

            expect(res.status).toBe(500);
        });

        it('should reject login with missing fields', async () => {
            const res = await request
                .post('/api/auth/login')
                .send({ email: testUser.email });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should issue new tokens with valid refresh token', async () => {
            const res = await request
                .post('/api/auth/refresh')
                .send({ refresh_token: refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.access_token).toBeDefined();
            expect(res.body.refresh_token).toBeDefined();

            // Update tokens (old refresh token is now blacklisted via rotation)
            accessToken = res.body.access_token;
            refreshToken = res.body.refresh_token;
        });

        it('should reject refresh with missing token', async () => {
            const res = await request
                .post('/api/auth/refresh')
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should blacklist tokens on logout', async () => {
            const res = await request
                .post('/api/auth/logout')
                .send({ accessToken, refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should reject reuse of blacklisted refresh token', async () => {
            const res = await request
                .post('/api/auth/refresh')
                .send({ refresh_token: refreshToken });

            expect(res.status).toBe(401);
        });
    });
});
