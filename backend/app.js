// app.js — Express app setup only, no app.listen()
// Kept separate from index.js so tests can import the app
// without actually starting a server on a port.

require('dotenv').config();

const express          = require('express');
const cors             = require('cors');
const authRouter       = require('./routes/auth');
const expensesRouter   = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth',       authRouter);
app.use('/expenses',   expensesRouter);
app.use('/categories', categoriesRouter);

app.use((req, res, next) => {
  next({ status: 404, message: `Route ${req.method} ${req.url} not found` });
});

app.use(errorHandler);

module.exports = app;