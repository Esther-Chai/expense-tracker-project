// prisma/seed.js
// Runs once to populate the database with a demo user + categories.
// Run with: npx prisma db seed
// (automatically runs after npx prisma migrate dev too)

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Check if demo user already exists
  const existing = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  });

  if (existing) {
    console.log('Seed already run — skipping');
    return;
  }

  // Create demo user
  const user = await prisma.user.create({
    data: {
      name:         'Demo User',
      email:        'demo@example.com',
      passwordHash: bcrypt.hashSync('demo1234', 10),
    },
  });

  // Create default categories for demo user
  const food      = await prisma.category.create({ data: { name: 'Food',      icon: '🍜', userId: user.id } });
  const transport = await prisma.category.create({ data: { name: 'Transport', icon: '🚗', userId: user.id } });
  const bills     = await prisma.category.create({ data: { name: 'Bills',     icon: '💡', userId: user.id } });

  // Seed sample expenses
  await prisma.expense.createMany({
    data: [
      { title: 'Grocery run',    amount: 45.50, date: '2024-01-10', userId: user.id, categoryId: food.id },
      { title: 'Grab to work',   amount: 12.00, date: '2024-01-11', userId: user.id, categoryId: transport.id },
      { title: 'Netflix',        amount: 18.00, date: '2024-01-11', userId: user.id, categoryId: bills.id },
      { title: 'Lunch with Bob', amount: 22.00, date: '2024-01-12', userId: user.id, categoryId: food.id },
    ],
  });

  console.log('✅ Seed complete — demo@example.com / demo1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());