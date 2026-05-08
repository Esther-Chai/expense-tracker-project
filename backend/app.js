require('dotenv').config();

const express          = require('express');
const cors             = require('cors');
const authRouter       = require('./routes/auth');
const expensesRouter   = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Allow requests from any origin (needed when opening HTML file directly)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/auth',       authRouter);
app.use('/expenses',   expensesRouter);
app.use('/categories', categoriesRouter);

app.use((req, res, next) => {
  next({ status: 404, message: `Route ${req.method} ${req.url} not found` });
});

app.use(errorHandler);

module.exports = app;