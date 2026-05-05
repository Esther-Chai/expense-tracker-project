const express             = require('express');
const router              = express.Router();
const db                  = require('../database');
const { createError }     = require('../middleware/errorHandler');
const { authenticate }    = require('../middleware/authenticate');

// All category routes require a valid token.
// authenticate runs before the route handler and sets req.user.
router.use(authenticate);

// GET /categories
router.get('/', (req, res, next) => {
  try {
    const categories = db.prepare(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name'
    ).all(req.user.id);  // req.user.id set by authenticate middleware
    res.json(categories);
  } catch (err) { next(err); }
});

// POST /categories  — Body: { name, icon? }
router.post('/', (req, res, next) => {
  try {
    const { name, icon } = req.body;
    if (!name) return next(createError(400, 'Category name is required'));

    const exists = db.prepare(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND user_id = ?'
    ).get(name, req.user.id);
    if (exists) return next(createError(400, 'Category already exists'));

    const result = db.prepare(
      'INSERT INTO categories (name, icon, user_id) VALUES (?, ?, ?)'
    ).run(name, icon || null, req.user.id);

    const newCat = db.prepare('SELECT * FROM categories WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json(newCat);
  } catch (err) { next(err); }
});

// DELETE /categories/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = db.prepare(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);
    if (!existing) return next(createError(404, 'Category not found'));

    const inUse = db.prepare(
      'SELECT COUNT(*) as count FROM expenses WHERE category_id = ?'
    ).get(id);
    if (inUse.count > 0)
      return next(createError(400, `Cannot delete — ${inUse.count} expense(s) use this category`));

    db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ message: 'Category deleted' });
  } catch (err) { next(err); }
});

module.exports = router;