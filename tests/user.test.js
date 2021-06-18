const request = require('supertest');
const app = require('../server');

describe('Authentication Testing', () => {
  test('Login', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'armpakin@hotmail.com',
        password: 'arm0869112178',
      })
      .expect(200);
  });
});
