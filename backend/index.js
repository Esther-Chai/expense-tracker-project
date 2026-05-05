require('dotenv').config(); // load .env file first — before anything else

const express          = require('express');
const cors             = require('cors');
const authRouter       = require('./routes/auth');
const expensesRouter   = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.use('/auth',       authRouter);       // public  — no token needed
app.use('/expenses',   expensesRouter);   // private — token required
app.use('/categories', categoriesRouter); // private — token required

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  next({ status: 404, message: `Route ${req.method} ${req.url} not found` });
});

// ─── Error handler (must be last) ────────────────────────────
app.use(errorHandler);

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
  console.log('');
  console.log('  POST   /auth/register');
  console.log('  POST   /auth/login');
  console.log('  GET    /expenses        (token required)');
  console.log('  POST   /expenses        (token required)');
  console.log('  PUT    /expenses/:id    (token required)');
  console.log('  DELETE /expenses/:id    (token required)');
  console.log('  GET    /categories      (token required)');
  console.log('  POST   /categories      (token required)');
});