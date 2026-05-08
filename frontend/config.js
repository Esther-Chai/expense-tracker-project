// config.js
// This file controls which backend URL the frontend points to.
//
// For local development: keep API pointing to localhost
// For production:        change API to your Railway URL
//
// You import this in index.html with:
//   <script src="config.js"></script>
//   (place it BEFORE the main <script> block)
//
// When deploying, the CI/CD pipeline automatically swaps this
// file's content using the VITE_API_URL secret — see the workflow.

const CONFIG = {
  API: window.location.hostname === 'localhost'
    ? 'http://localhost:3000'           // local dev
    : 'https://YOUR_RAILWAY_URL.railway.app',  // ← replace with your Railway URL
};