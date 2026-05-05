const express         = require('express');
const router          = express.Router();
const bcrypt          = require('bcryptjs');
const jwt             = require('jsonwebtoken');
const db              = require('../database');
const { createError } = require('../middleware/errorHandler');

// Your JWT secret — in a real app this goes in a .env file, never hardcoded
// We'll set it up with dotenv below
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';

// ─── Helper: create a signed token ───────────────────────────
// Takes a user object, returns a JWT string that expires in 7 days.
// The token "payload" is just the user's id and email — enough to
// identify who's making the request without hitting the database.
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email }, // payload (data inside the token)
    JWT_SECRET,                          // secret key used to sign it
    { expiresIn: '7d' }                  // token expires after 7 days
  );
}

// ─── POST /auth/register ──────────────────────────────────────
// Body: { name, email, password }
// Creates a new user, seeds their default categories, returns a token
router.post('/register', (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name)     return next(createError(400, 'Name is required'));
    if (!email)    return next(createError(400, 'Email is required'));
    if (!password) return next(createError(400, 'Password is required'));
    if (password.length < 6)
                   return next(createError(400, 'Password must be at least 6 characters'));

    // Check if email is already taken
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return next(createError(400, 'Email already in use'));

    // bcrypt.hashSync(password, 10)
    // The '10' is the "salt rounds" — how many times it scrambles the password.
    // Higher = more secure but slower. 10 is the standard safe value.
    const password_hash = bcrypt.hashSync(password, 10);

    // Save the new user
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).run(name, email, password_hash);

    const userId = result.lastInsertRowid;

    // Seed default categories for this new user
    const insertCat = db.prepare(
      'INSERT INTO categories (name, icon, user_id) VALUES (?, ?, ?)'
    );
    [
      { name: 'Food',      icon: '🍜' },
      { name: 'Transport', icon: '🚗' },
      { name: 'Bills',     icon: '💡' },
      { name: 'Other',     icon: '📦' },
    ].forEach(c => insertCat.run(c.name, c.icon, userId));

    // Create and return a token — user is logged in immediately after registering
    const user  = { id: userId, email };
    const token = createToken(user);

    res.status(201).json({
      message: 'Account created!',
      token,                        // frontend stores this
      user: { id: userId, name, email },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/login ─────────────────────────────────────────
// Body: { email, password }
// Checks credentials, returns a token if correct
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email)    return next(createError(400, 'Email is required'));
    if (!password) return next(createError(400, 'Password is required'));

    // Look up the user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Use a vague error — never tell the user which field is wrong
    // (otherwise attackers can tell if an email exists in your system)
    if (!user) return next(createError(401, 'Invalid email or password'));

    // bcrypt.compareSync compares the plain password against the stored hash
    // It returns true/false — you never "decrypt" a bcrypt hash
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) return next(createError(401, 'Invalid email or password'));

    const token = createToken(user);

    res.json({
      message: 'Logged in!',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;