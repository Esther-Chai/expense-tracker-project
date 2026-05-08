const express          = require('express');
const router           = express.Router();
const prisma           = require('../database');
const { createError }  = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authenticate');

router.use(authenticate);

// GET /categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where:   { userId: req.user.id },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) { next(err); }
});

// POST /categories
router.post('/', async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    if (!name) return next(createError(400, 'Category name is required'));

    const category = await prisma.category.create({
      data: { name, icon: icon || null, userId: req.user.id },
    });
    res.status(201).json(category);
  } catch (err) {
    // Prisma throws P2002 on unique constraint violation
    if (err.code === 'P2002') return next(createError(400, 'Category already exists'));
    next(err);
  }
});

// DELETE /categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const category = await prisma.category.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!category) return next(createError(404, 'Category not found'));

    // Check if any expenses use this category
    const inUse = await prisma.expense.count({ where: { categoryId: id } });
    if (inUse > 0) return next(createError(400, `Cannot delete — ${inUse} expense(s) use this category`));

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (err) { next(err); }
});

module.exports = router;