// __tests__/api.test.js
// Supertest lets us make real HTTP requests to our Express app
// without needing the server to actually be running on a port.
// It spins up the app in-memory for each test.

const request = require('supertest');
const app     = require('../app'); // we'll extract app from index.js below

// ─── Auth routes ─────────────────────────────────────────────
describe('POST /auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: `test_${Date.now()}@example.com`, password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');        // token exists
    expect(res.body.user).toHaveProperty('email');   // user object returned
  });

  it('rejects registration with missing fields', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'missing@name.com' }); // no name or password

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects duplicate email', async () => {
    const email = `dup_${Date.now()}@example.com`;
    // First registration — should succeed
    await request(app)
      .post('/auth/register')
      .send({ name: 'First', email, password: 'password123' });

    // Second registration with same email — should fail
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Second', email, password: 'password123' });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /auth/login', () => {
  // Register once, use across login tests
  const email    = `login_${Date.now()}@example.com`;
  const password = 'testpass123';

  beforeAll(async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Login Test', email, password });
  });

  it('logs in with correct credentials and returns token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(res.statusCode).toBe(401);
  });
});

// ─── Protected routes (expenses) ─────────────────────────────
describe('Expenses API', () => {
  let token;       // JWT token for this test suite
  let categoryId;  // category to attach expenses to

  // Before all tests: register a user and grab their token + first category
  beforeAll(async () => {
    const reg = await request(app)
      .post('/auth/register')
      .send({ name: 'Expense Tester', email: `expenses_${Date.now()}@example.com`, password: 'pass123' });

    token = reg.body.token;

    // Get the default categories seeded for this user
    const cats = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${token}`);

    categoryId = cats.body[0].id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/expenses'); // no token
    expect(res.statusCode).toBe(401);
  });

  it('returns empty array for new user', async () => {
    const res = await request(app)
      .get('/expenses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('creates a new expense', async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Lunch', amount: 15.50, category_id: categoryId, date: '2024-01-15' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Lunch');
    expect(res.body.amount).toBe(15.50);
  });

  it('rejects expense with missing fields', async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No amount' }); // missing amount, category, date

    expect(res.statusCode).toBe(400);
  });

  it('rejects negative amount', async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bad', amount: -5, category_id: categoryId, date: '2024-01-15' });

    expect(res.statusCode).toBe(400);
  });
});

// ─── Categories API ───────────────────────────────────────────
describe('Categories API', () => {
  let token;

  beforeAll(async () => {
    const reg = await request(app)
      .post('/auth/register')
      .send({ name: 'Cat Tester', email: `cats_${Date.now()}@example.com`, password: 'pass123' });
    token = reg.body.token;
  });

  it('returns default categories for new user', async () => {
    const res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // seeded defaults exist
  });

  it('creates a new category', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Entertainment', icon: '🎮' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Entertainment');
  });

  it('rejects duplicate category name', async () => {
    await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', icon: '📦' });

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', icon: '📦' });

    expect(res.statusCode).toBe(400);
  });
});