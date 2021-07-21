const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const {
    new_account,
    test_user_account_1,
    test_user_account_2,
    test_user_account_3,
} = require('./authAccount');

beforeAll(async () => {
    await User.deleteMany();
});

afterAll(async () => {
    await app.close();
});

describe('Register account', () => {
    test('Register a new account', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(new_account)
            .expect(200);

        expect(response.body).toMatchObject({
            success: true,
            message: 'The email is sent, please verify your email'
        });
    });

    test('Register password was hash', async () => {
        const user = await User.findOne({ email: new_account.email });

        expect(user.password).not.toBe(new_account.password);
    });

    test('Register a duplicate email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(new_account)
            .expect(400);

        expect(response.body).toMatchObject({
            success: false,
            message: 'This email is already used'
        });
    });
});

describe('Login account', () => {
    test('Login without verify email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send(test_user_account_1)
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Please verify email'
        });
    });

    test('Verify email within 10 mins', async () => {
        const user = await User.findOne({ email: test_user_account_1.email });
        const response = await request(app)
            .put(`/api/auth/verified-email/${user.verifiedEmailToken}`)
            .expect(201);

        expect(response.body).toMatchObject({
            success: true,
            message: 'Your email address has been verified'
        });
    });

    test('Verify email later than 10 mins', async () => {
        const response = await request(app)
            .put(
                `/api/auth/verified-email/dace365fa02775025c36b2f69a6609ea8b198505`
            )
            .expect(400);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Verify token has been expired, please register again'
        });
    });

    test('Login with not exist email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send(test_user_account_2)
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Invalid credentials'
        });
    });

    test('Login with exist email but wrong password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send(test_user_account_3)
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Invalid credentials'
        });
    });
});

describe('Sent forgot password email', () => {
    test('Sent forgot password email with not exist email', async () => {
        const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: test_user_account_2.email })
            .expect(400);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Email could not be sent'
        });
    });

    test('Sent forgot password with exist email', async () => {
        const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: test_user_account_1.email })
            .expect(200);

        expect(response.body).toMatchObject({
            success: true,
            message: 'Email is sent, please check in mailbox'
        });
    });
});

describe('Reset account password', () => {
    test('Reset password within 10 mins', async () => {
        const user = await User.findOne({ email: test_user_account_1.email });
        const response = await request(app)
            .put(`/api/auth/reset-password/${user.resetPasswordToken}`)
            .send({ password: test_user_account_2.password })
            .expect(201);

        expect(response.body).toMatchObject({
            success: true,
            message: 'Congrats! Now you can login with the new password'
        });
    });

    test('Reset password later than 10 mins', async () => {
        const response = await request(app)
            .put(
                `/api/auth/reset-password/dace365fa02775025c36b2f69a6609ea8b198505`
            )
            .send({ password: test_user_account_2.password })
            .expect(400);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Expired link, please try again'
        });
    });
});
