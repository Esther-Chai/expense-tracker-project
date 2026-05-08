# ── Stage 1: Build ───────────────────────────────────────────
# Use official Node.js image as base
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker caches this layer —
# so npm install only re-runs if package.json changes)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# ── Stage 2: Run ─────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy installed node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the rest of the app source code
COPY . .

# Create a folder for the SQLite database file to persist
# (in production you'd mount a volume here)
RUN mkdir -p /app/data

# Expose the port Express listens on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "index.js"]