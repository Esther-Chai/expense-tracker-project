// database.js
// Creates and exports a single shared Prisma client instance.
// Import this anywhere you need database access:
//   const prisma = require('./database');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;