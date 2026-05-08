const express         = require('express');
const router          = express.Router();
const bcrypt          = require('bcryptjs');
const jwt             = require('jsonwebtoken');
const prisma          = require('../database');
const { createError } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name)     return next(createError(400, 'Name is required'));
    if (!email)    return next(createError(400, 'Email is required'));
    if (!password) return next(createError(400, 'Password is required'));
    if (password.length < 6) return next(createError(400, 'Password must be at least 6 characters'));

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return next(createError(400, 'Email already in use'));

    const user = await prisma.user.create({
      data: { name, email, passwordHash: bcrypt.hashSync(password, 10) },
    });

    // Seed default categories for new user
    await prisma.category.createMany({
      data: [
        { name: 'Food',      icon: '🍜', userId: user.id },
        { name: 'Transport', icon: '🚗', userId: user.id },
        { name: 'Bills',     icon: '💡', userId: user.id },
        { name: 'Other',     icon: '📦', userId: user.id },
      ],
    });

    const token = createToken(user);
    res.status(201).json({ message: 'Account created!', token, user: { id: user.id, name, email } });
  } catch (err) { next(err); }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email)    return next(createError(400, 'Email is required'));
    if (!password) return next(createError(400, 'Password is required'));

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(createError(401, 'Invalid email or password'));

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) return next(createError(401, 'Invalid email or password'));

    const token = createToken(user);
    res.json({ message: 'Logged in!', token, user: { id: user.id, name: user.name, email } });
  } catch (err) { next(err); }
});

module.exports = router;