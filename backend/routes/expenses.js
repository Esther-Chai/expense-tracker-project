const express          = require('express');
const router           = express.Router();
const db               = require('../database');
const { createError }  = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authenticate');

// All expense routes require a valid JWT token
router.use(authenticate);

// GET /expenses — supports ?category ?from ?to
router.get('/', (req, res, next) => {
  try {
    const { category, from, to } = req.query;
    let query  = `
      SELECT e.id, e.title, e.amount, e.date, e.notes, e.created_at,
             c.name AS category, c.icon AS category_icon
      FROM   expenses e
      JOIN   categories c ON e.category_id = c.id
      WHERE  e.user_id = ?`;
    const params = [req.user.id]; // real user ID from token

    if (category) { query += ' AND LOWER(c.name) = LOWER(?)'; params.push(category); }
    if (from)     { query += ' AND e.date >= ?'; params.push(from); }
    if (to)       { query += ' AND e.date <= ?'; params.push(to); }
    query += ' ORDER BY e.date DESC, e.created_at DESC';

    res.json(db.prepare(query).all(...params));
  } catch (err) { next(err); }
});

// GET /expenses/summary
router.get('/summary', (req, res, next) => {
  try {
    const { from, to } = req.query;
    let query = `
      SELECT c.name AS category, c.icon AS icon,
             ROUND(SUM(e.amount), 2) AS total, COUNT(e.id) AS count
      FROM   expenses e
      JOIN   categories c ON e.category_id = c.id
      WHERE  e.user_id = ?`;
    const params = [req.user.id];

    if (from) { query += ' AND e.date >= ?'; params.push(from); }
    if (to)   { query += ' AND e.date <= ?'; params.push(to); }
    query += ' GROUP BY c.id ORDER BY total DESC';

    res.json(db.prepare(query).all(...params));
  } catch (err) { next(err); }
});

// GET /expenses/export
router.get('/export', (req, res, next) => {
  try {
    const { category, from, to } = req.query;
    let query = `
      SELECT e.id, e.title, e.amount, e.date, e.notes, c.name AS category
      FROM   expenses e
      JOIN   categories c ON e.category_id = c.id
      WHERE  e.user_id = ?`;
    const params = [req.user.id];

    if (category) { query += ' AND LOWER(c.name) = LOWER(?)'; params.push(category); }
    if (from)     { query += ' AND e.date >= ?'; params.push(from); }
    if (to)       { query += ' AND e.date <= ?'; params.push(to); }

    const expenses = db.prepare(query).all(...params);
    const csv = [
      'id,title,amount,category,date,notes',
      ...expenses.map(e => `${e.id},"${e.title}",${e.amount},${e.category},${e.date},"${e.notes || ''}"`)
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) { next(err); }
});

// POST /expenses
router.post('/', (req, res, next) => {
  try {
    const { title, amount, category_id, date, notes } = req.body;

    if (!title)       return next(createError(400, 'Title is required'));
    if (!amount)      return next(createError(400, 'Amount is required'));
    if (!category_id) return next(createError(400, 'Category is required'));
    if (!date)        return next(createError(400, 'Date is required'));
    if (isNaN(amount) || amount <= 0)
                      return next(createError(400, 'Amount must be a positive number'));

    const cat = db.prepare(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?'
    ).get(category_id, req.user.id);
    if (!cat) return next(createError(404, 'Category not found'));

    const result = db.prepare(`
      INSERT INTO expenses (title, amount, date, notes, user_id, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, parseFloat(amount), date, notes || null, req.user.id, category_id);

    const newExpense = db.prepare(`
      SELECT e.*, c.name AS category, c.icon AS category_icon
      FROM expenses e JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newExpense);
  } catch (err) { next(err); }
});

// PUT /expenses/:id
router.put('/:id', (req, res, next) => {
  try {
    const id       = parseInt(req.params.id);
    const existing = db.prepare(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);
    if (!existing) return next(createError(404, `Expense ${id} not found`));

    if (req.body.amount && (isNaN(req.body.amount) || req.body.amount <= 0))
      return next(createError(400, 'Amount must be a positive number'));

    if (req.body.category_id) {
      const cat = db.prepare(
        'SELECT id FROM categories WHERE id = ? AND user_id = ?'
      ).get(req.body.category_id, req.user.id);
      if (!cat) return next(createError(404, 'Category not found'));
    }

    const updated = {
      title:       req.body.title       || existing.title,
      amount:      req.body.amount      ? parseFloat(req.body.amount) : existing.amount,
      date:        req.body.date        || existing.date,
      notes:       req.body.notes       !== undefined ? req.body.notes : existing.notes,
      category_id: req.body.category_id || existing.category_id,
    };

    db.prepare(`
      UPDATE expenses SET title=?, amount=?, date=?, notes=?, category_id=?
      WHERE id=? AND user_id=?
    `).run(updated.title, updated.amount, updated.date, updated.notes, updated.category_id, id, req.user.id);

    const result = db.prepare(`
      SELECT e.*, c.name AS category, c.icon AS category_icon
      FROM expenses e JOIN categories c ON e.category_id = c.id WHERE e.id = ?
    `).get(id);

    res.json(result);
  } catch (err) { next(err); }
});

// DELETE /expenses/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id     = parseInt(req.params.id);
    const exists = db.prepare(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);
    if (!exists) return next(createError(404, `Expense ${id} not found`));

    db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ message: `Expense ${id} deleted` });
  } catch (err) { next(err); }
});

module.exports = router;