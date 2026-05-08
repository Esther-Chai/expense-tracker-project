// index.js — only starts the server
// All app logic lives in app.js
const app  = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('  POST   /auth/register');
  console.log('  POST   /auth/login');
  console.log('  GET    /expenses        (token required)');
  console.log('  POST   /expenses        (token required)');
  console.log('  PUT    /expenses/:id    (token required)');
  console.log('  DELETE /expenses/:id    (token required)');
  console.log('  GET    /categories      (token required)');
  console.log('  POST   /categories      (token required)');
  console.log('  DELETE /categories/:id  (token required)');
});