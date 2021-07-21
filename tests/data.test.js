const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { admin_account, user_account, setupAccount } = require('./dataAccount');

beforeAll(async () => {
    await User.deleteMany();
    await setupAccount();
});

afterAll(async () => {
    await app.close();
});

let userToken;
let adminToken;

describe('Request data by USER role', () => {
    test('Request dashboard data', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send(user_account);
        userToken = response.body.token;
        await request(app)
            .get('/api/data')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
    });

    test('Request users lists data', async () => {
        const response = await request(app)
            .get('/api/data/users')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: 'Not authorized to access this route'
        });
    });
});

describe('Request data by Admin role', () => {
    test('Request dashboard data', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send(admin_account);
        adminToken = response.body.token;
        await request(app)
            .get('/api/data')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });

    test('Request users lists data', async () => {
        await request(app)
            .get('/api/data/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });
});
