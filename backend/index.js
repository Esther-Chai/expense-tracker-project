const express        = require('express');
const cors           = require('cors');
const expensesRouter = require('./routes/expenses');
const { errorHandler } = require('./middleware/errorHandler'); // import error handler

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.use('/expenses', expensesRouter);

// ─── 404 handler ─────────────────────────────────────────────
// Catches any request that didn't match a route above
app.use((req, res, next) => {
  next({ status: 404, message: `Route ${req.method} ${req.url} not found` });
});

// ─── Error handler ────────────────────────────────────────────
// MUST be last — after all routes and the 404 handler
// Express knows this is an error handler because it has 4 params
app.use(errorHandler);

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});