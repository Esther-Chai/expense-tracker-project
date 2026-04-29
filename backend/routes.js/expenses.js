const express     = require('express');
const router      = express.Router();
const fs          = require('fs');
const path        = require('path');
const { createError } = require('../middleware/errorHandler'); // import helper

// ─── File persistence ─────────────────────────────────────────
const DB_FILE = path.join(__dirname, '..', 'expenses.json');

function loadData() {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  const defaultData = {
    expenses: [
      { id: 1, title: 'Grocery run',    amount: 45.50, category: 'Food',      date: '2024-01-10' },
      { id: 2, title: 'Grab to work',   amount: 12.00, category: 'Transport', date: '2024-01-11' },
      { id: 3, title: 'Netflix',        amount: 18.00, category: 'Bills',     date: '2024-01-11' },
      { id: 4, title: 'Lunch with Bob', amount: 22.00, category: 'Food',      date: '2024-01-12' },
    ],
    nextId: 5,
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
  return defaultData;
}

function saveData() {
  fs.writeFileSync(DB_FILE, JSON.stringify({ expenses, nextId }, null, 2));
}

let { expenses, nextId } = loadData();

// ─── ROUTES ──────────────────────────────────────────────────
// Every route now accepts `next` as the 3rd param.
// When something goes wrong, we call next(createError(...))
// instead of writing res.status().json() inline.

// GET /expenses
router.get('/', (req, res, next) => {
  try {
    const { category, from, to } = req.query;
    let result = [...expenses];
    if (category) result = result.filter(e => e.category.toLowerCase() === category.toLowerCase());
    if (from)     result = result.filter(e => e.date >= from);
    if (to)       result = result.filter(e => e.date <= to);
    res.json(result);
  } catch (err) {
    next(err); // unexpected error — pass to error handler
  }
});

// GET /expenses/summary
router.get('/summary', (req, res, next) => {
  try {
    const { from, to } = req.query;
    let result = [...expenses];
    if (from) result = result.filter(e => e.date >= from);
    if (to)   result = result.filter(e => e.date <= to);

    const summary = {};
    result.forEach(e => {
      if (!summary[e.category]) summary[e.category] = 0;
      summary[e.category] += e.amount;
    });

    res.json(Object.entries(summary).map(([category, total]) => ({
      category,
      total: parseFloat(total.toFixed(2)),
    })));
  } catch (err) {
    next(err);
  }
});

// GET /expenses/export
router.get('/export', (req, res, next) => {
  try {
    const { category, from, to } = req.query;
    let result = [...expenses];
    if (category) result = result.filter(e => e.category.toLowerCase() === category.toLowerCase());
    if (from)     result = result.filter(e => e.date >= from);
    if (to)       result = result.filter(e => e.date <= to);

    const csv = ['id,title,amount,category,date',
      ...result.map(e => `${e.id},"${e.title}",${e.amount},${e.category},${e.date}`)
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// POST /expenses
router.post('/', (req, res, next) => {
  try {
    const { title, amount, category, date } = req.body;

    // Validation — use createError instead of inline res.status().json()
    if (!title)    return next(createError(400, 'Title is required'));
    if (!amount)   return next(createError(400, 'Amount is required'));
    if (!category) return next(createError(400, 'Category is required'));
    if (!date)     return next(createError(400, 'Date is required'));
    if (isNaN(amount) || amount <= 0)
                   return next(createError(400, 'Amount must be a positive number'));

    const newExpense = { id: nextId++, title, amount: parseFloat(amount), category, date };
    expenses.push(newExpense);
    saveData();
    res.status(201).json(newExpense);
  } catch (err) {
    next(err);
  }
});

// PUT /expenses/:id
router.put('/:id', (req, res, next) => {
  try {
    const id    = parseInt(req.params.id);
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1)
      return next(createError(404, `Expense with id ${id} not found`));

    if (req.body.amount && (isNaN(req.body.amount) || req.body.amount <= 0))
      return next(createError(400, 'Amount must be a positive number'));

    expenses[index] = {
      ...expenses[index],
      ...req.body,
      id,
      amount: req.body.amount ? parseFloat(req.body.amount) : expenses[index].amount,
    };

    saveData();
    res.json(expenses[index]);
  } catch (err) {
    next(err);
  }
});

// DELETE /expenses/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id    = parseInt(req.params.id);
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1)
      return next(createError(404, `Expense with id ${id} not found`));

    expenses.splice(index, 1);
    saveData();
    res.json({ message: `Expense ${id} deleted` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;const express     = require('express');
const router      = express.Router();
const fs          = require('fs');
const path        = require('path');
const { createError } = require('../middleware/errorHandler'); // import helper

// ─── File persistence ─────────────────────────────────────────
const DB_FILE = path.join(__dirname, '..', 'expenses.json');

function loadData() {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  const defaultData = {
    expenses: [
      { id: 1, title: 'Grocery run',    amount: 45.50, category: 'Food',      date: '2024-01-10' },
      { id: 2, title: 'Grab to work',   amount: 12.00, category: 'Transport', date: '2024-01-11' },
      { id: 3, title: 'Netflix',        amount: 18.00, category: 'Bills',     date: '2024-01-11' },
      { id: 4, title: 'Lunch with Bob', amount: 22.00, category: 'Food',      date: '2024-01-12' },
    ],
    nextId: 5,
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
  return defaultData;
}

function saveData() {
  fs.writeFileSync(DB_FILE, JSON.stringify({ expenses, nextId }, null, 2));
}

let { expenses, nextId } = loadData();

// ─── ROUTES ──────────────────────────────────────────────────
// Every route now accepts `next` as the 3rd param.
// When something goes wrong, we call next(createError(...))
// instead of writing res.status().json() inline.

// GET /expenses
router.get('/', (req, res, next) => {
  try {
    const { category, from, to } = req.query;
    let result = [...expenses];
    if (category) result = result.filter(e => e.category.toLowerCase() === category.toLowerCase());
    if (from)     result = result.filter(e => e.date >= from);
    if (to)       result = result.filter(e => e.date <= to);
    res.json(result);
  } catch (err) {
    next(err); // unexpected error — pass to error handler
  }
});

// GET /expenses/summary
router.get('/summary', (req, res, next) => {
  try {
    const { from, to } = req.query;
    let result = [...expenses];
    if (from) result = result.filter(e => e.date >= from);
    if (to)   result = result.filter(e => e.date <= to);

    const summary = {};
    result.forEach(e => {
      if (!summary[e.category]) summary[e.category] = 0;
      summary[e.category] += e.amount;
    });

    res.json(Object.entries(summary).map(([category, total]) => ({
      category,
      total: parseFloat(total.toFixed(2)),
    })));
  } catch (err) {
    next(err);
  }
});

// GET /expenses/export
router.get('/export', (req, res, next) => {
  try {
    const { category, from, to } = req.query;
    let result = [...expenses];
    if (category) result = result.filter(e => e.category.toLowerCase() === category.toLowerCase());
    if (from)     result = result.filter(e => e.date >= from);
    if (to)       result = result.filter(e => e.date <= to);

    const csv = ['id,title,amount,category,date',
      ...result.map(e => `${e.id},"${e.title}",${e.amount},${e.category},${e.date}`)
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// POST /expenses
router.post('/', (req, res, next) => {
  try {
    const { title, amount, category, date } = req.body;

    // Validation — use createError instead of inline res.status().json()
    if (!title)    return next(createError(400, 'Title is required'));
    if (!amount)   return next(createError(400, 'Amount is required'));
    if (!category) return next(createError(400, 'Category is required'));
    if (!date)     return next(createError(400, 'Date is required'));
    if (isNaN(amount) || amount <= 0)
                   return next(createError(400, 'Amount must be a positive number'));

    const newExpense = { id: nextId++, title, amount: parseFloat(amount), category, date };
    expenses.push(newExpense);
    saveData();
    res.status(201).json(newExpense);
  } catch (err) {
    next(err);
  }
});

// PUT /expenses/:id
router.put('/:id', (req, res, next) => {
  try {
    const id    = parseInt(req.params.id);
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1)
      return next(createError(404, `Expense with id ${id} not found`));

    if (req.body.amount && (isNaN(req.body.amount) || req.body.amount <= 0))
      return next(createError(400, 'Amount must be a positive number'));

    expenses[index] = {
      ...expenses[index],
      ...req.body,
      id,
      amount: req.body.amount ? parseFloat(req.body.amount) : expenses[index].amount,
    };

    saveData();
    res.json(expenses[index]);
  } catch (err) {
    next(err);
  }
});

// DELETE /expenses/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id    = parseInt(req.params.id);
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1)
      return next(createError(404, `Expense with id ${id} not found`));

    expenses.splice(index, 1);
    saveData();
    res.json({ message: `Expense ${id} deleted` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;