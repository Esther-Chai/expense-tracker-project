const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';

// ─── authenticate middleware ──────────────────────────────────
// Add this to any route you want to protect.
// It reads the token from the Authorization header, verifies it,
// and attaches the decoded user info to req.user.
//
// Usage in a route file:
//   const { authenticate } = require('../middleware/authenticate');
//   router.get('/', authenticate, (req, res) => {
//     console.log(req.user.id); // the logged-in user's ID
//   });
//
function authenticate(req, res, next) {
  // The frontend sends the token like this:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // grab part after "Bearer "

  if (!token) {
    return res.status(401).json({ error: { message: 'No token provided — please log in', status: 401 } });
  }

  try {
    // jwt.verify checks:
    // 1. Was this token signed with our secret? (not tampered with)
    // 2. Has it expired?
    // If both pass, it returns the payload we put in when we signed it
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to the request — routes can now access req.user.id
    req.user = decoded; // { id, email, iat, exp }
    next();             // move on to the actual route handler
  } catch (err) {
    // Token is invalid or expired
    return res.status(403).json({ error: { message: 'Invalid or expired token — please log in again', status: 403 } });
  }
}

module.exports = { authenticate };