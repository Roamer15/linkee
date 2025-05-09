// tests/auth.test.js
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict'; // ✅ Add assert
import supertest from 'supertest';
import { pool, initializeDbSchema, connectToDb  } from '../config/db.js'; // Import the pool
import app from '../app.js'; // wherever your Express app is exported

const request = supertest(app);

describe('Auth Endpoints', () => {
  const testUser = {
    username: `yay${Date.now()}`,
    email: `testuser${Date.now()}@example.com`,
    password: 'Test1234',
  };

  before(async () => {
    await connectToDb();      // Ensure connection
    await initializeDbSchema(); // Create tables
  });

  // ✅ Optional: Clean up after tests
  after(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
  });

  test('should register a new user', async () => {
    const res = await request
      .post('/api/auth/register')
      .set('Content-Type', 'application/json') // ← Add this
      .send(testUser);
    
    if (res.status !== 201) {
      console.log('FAILED REGISTER RESPONSE:', res.body); // ← Debug log
    }
    
    assert.equal(res.status, 201);
  });

  test('should not register with missing fields', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ email: '' })
      .expect(400); // Assuming bad request

    assert.ok(res.body.message, 'Response body should have a message');
  });

  test('should not allow duplicate registration', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(testUser)
      .expect(409); // Conflict if you use this code

    assert.ok(res.body.message, 'Response body should have a message');
  });

  test('should log in with correct credentials', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    assert.ok(res.body.token, 'Response should include a token');
  });

  test('should fail login with wrong password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({email: testUser.email, password: 'WrongPass123' })
      .expect(401); // Unauthorized

    assert.ok(res.body.message, 'Response should include a message');
  });
});
