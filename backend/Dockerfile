FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Generate Prisma client into node_modules
RUN npx prisma generate

# Copy rest of source code
COPY . .

EXPOSE 3000

ENV NODE_ENV=production

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]