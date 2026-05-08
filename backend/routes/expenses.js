const express          = require('express');
const router           = express.Router();
const prisma           = require('../database');
const { createError }  = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authenticate');

router.use(authenticate);

// GET /expenses — supports ?category ?from ?to filters
router.get('/', async (req, res, next) => {
  try {
    const { category, from, to } = req.query;

    // Build Prisma where clause dynamically
    const where = {
      userId: req.user.id,
      ...(category && { category: { name: { equals: category, mode: 'insensitive' } } }),
      ...(from || to) && {
        date: {
          ...(from && { gte: from }),
          ...(to   && { lte: to   }),
        },
      },
    };

    const expenses = await prisma.expense.findMany({
      where,
      include:  { category: true },  // joins category so we get name + icon
      orderBy:  [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(expenses);
  } catch (err) { next(err); }
});

// GET /expenses/summary
router.get('/summary', async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const where = {
      userId: req.user.id,
      ...(from || to) && {
        date: {
          ...(from && { gte: from }),
          ...(to   && { lte: to   }),
        },
      },
    };

    // Prisma groupBy to total per category
    const grouped = await prisma.expense.groupBy({
      by:     ['categoryId'],
      where,
      _sum:   { amount: true },
      _count: { id: true },
    });

    // Fetch category details for each group
    const summary = await Promise.all(
      grouped.map(async (g) => {
        const cat = await prisma.category.findUnique({ where: { id: g.categoryId } });
        return {
          category: cat.name,
          icon:     cat.icon,
          total:    Math.round(g._sum.amount * 100) / 100,
          count:    g._count.id,
        };
      })
    );

    res.json(summary.sort((a, b) => b.total - a.total));
  } catch (err) { next(err); }
});

// GET /expenses/export — CSV download
router.get('/export', async (req, res, next) => {
  try {
    const { category, from, to } = req.query;

    const where = {
      userId: req.user.id,
      ...(category && { category: { name: { equals: category, mode: 'insensitive' } } }),
      ...(from || to) && { date: { ...(from && { gte: from }), ...(to && { lte: to }) } },
    };

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
    });

    const csv = [
      'id,title,amount,category,date,notes',
      ...expenses.map(e =>
        `${e.id},"${e.title}",${e.amount},${e.category.name},${e.date},"${e.notes || ''}"`)
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) { next(err); }
});

// POST /expenses
router.post('/', async (req, res, next) => {
  try {
    const { title, amount, categoryId, date, notes } = req.body;

    if (!title)      return next(createError(400, 'Title is required'));
    if (!amount)     return next(createError(400, 'Amount is required'));
    if (!categoryId) return next(createError(400, 'Category is required'));
    if (!date)       return next(createError(400, 'Date is required'));
    if (isNaN(amount) || amount <= 0)
                     return next(createError(400, 'Amount must be a positive number'));

    // Verify category belongs to this user
    const cat = await prisma.category.findFirst({
      where: { id: parseInt(categoryId), userId: req.user.id },
    });
    if (!cat) return next(createError(404, 'Category not found'));

    const expense = await prisma.expense.create({
      data: {
        title,
        amount:     parseFloat(amount),
        date,
        notes:      notes || null,
        userId:     req.user.id,
        categoryId: parseInt(categoryId),
      },
      include: { category: true },
    });

    res.status(201).json(expense);
  } catch (err) { next(err); }
});

// PUT /expenses/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.expense.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) return next(createError(404, `Expense ${id} not found`));

    if (req.body.amount && (isNaN(req.body.amount) || req.body.amount <= 0))
      return next(createError(400, 'Amount must be a positive number'));

    if (req.body.categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: parseInt(req.body.categoryId), userId: req.user.id },
      });
      if (!cat) return next(createError(404, 'Category not found'));
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(req.body.title      && { title:      req.body.title }),
        ...(req.body.amount     && { amount:     parseFloat(req.body.amount) }),
        ...(req.body.date       && { date:       req.body.date }),
        ...(req.body.notes      !== undefined && { notes: req.body.notes }),
        ...(req.body.categoryId && { categoryId: parseInt(req.body.categoryId) }),
      },
      include: { category: true },
    });

    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /expenses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.expense.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) return next(createError(404, `Expense ${id} not found`));

    await prisma.expense.delete({ where: { id } });
    res.json({ message: `Expense ${id} deleted` });
  } catch (err) { next(err); }
});

module.exports = router;