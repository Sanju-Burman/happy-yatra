const supertest = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase } = require('./setup');
const User = require('../src/models/user.model');
const crypto = require('crypto');

const request = supertest(app);

const testUser = {
    name: 'Password Manager User',
    email: 'pwuser@happy-yatra.com',
    password: 'OldPassword123!'
};

beforeAll(async () => {
    await connect();
    // Register the user first
    await request.post('/api/auth/signup').send(testUser);
});

afterAll(async () => {
    await closeDatabase();
});

describe('Password Management & Recovery', () => {

    describe('Forgot & Reset Password Flow', () => {
        it('should accept valid email and set reset token in DB', async () => {
            const res = await request
                .post('/api/auth/forgot-password')
                .send({ email: testUser.email });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Fetch user directly from DB to grab the reset token
            const user = await User.findOne({ email: testUser.email }).select('+passwordResetToken +passwordResetExpires');
            expect(user.passwordResetToken).toBeDefined();
            expect(user.passwordResetExpires).toBeDefined();
            expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
        });

        it('should reject non-existent email', async () => {
            const res = await request
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@test.com' });

            expect(res.status).toBe(404);
        });

        it('should successfully reset password with valid token', async () => {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

            await User.findOneAndUpdate(
                { email: testUser.email },
                {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: Date.now() + 15 * 60 * 1000
                }
            );

            const res = await request
                .post('/api/auth/reset-password')
                .send({
                    token: rawToken,
                    password: 'NewSuperPassword123!'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify login with new password
            const loginRes = await request
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'NewSuperPassword123!'
                });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.access_token).toBeDefined();
        });

        it('should reject invalid or expired reset token', async () => {
            const res = await request
                .post('/api/auth/reset-password')
                .send({
                    token: 'invalidtoken123',
                    password: 'AnotherPassword123!'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('Inline Password Change Profile Endpoint', () => {
        let token;

        beforeAll(async () => {
            // Login with the reset password from previous test
            const loginRes = await request
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'NewSuperPassword123!'
                });
            token = loginRes.body.access_token;
        });

        it('should change password successfully when old password matches', async () => {
            const res = await request
                .patch('/api/user/profile/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    oldPassword: 'NewSuperPassword123!',
                    newPassword: 'EvenNewerPassword123!'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify login with the updated password
            const loginRes = await request
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'EvenNewerPassword123!'
                });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.access_token).toBeDefined();
        });

        it('should reject password change when old password is incorrect', async () => {
            const res = await request
                .patch('/api/user/profile/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    oldPassword: 'WrongOldPassword123!',
                    newPassword: 'SomeOtherPassword123!'
                });

            expect(res.status).toBe(400);
        });

        it('should reject password change when new password is too short', async () => {
            const res = await request
                .patch('/api/user/profile/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    oldPassword: 'EvenNewerPassword123!',
                    newPassword: '123'
                });

            expect(res.status).toBe(400);
        });
    });
});
