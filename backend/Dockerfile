# Dockerfile for Training App Backend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for migration scripts)
RUN npm ci

# Copy application files
COPY . .

# Make start.sh executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
# Note: Migration should be run manually via Coolify Terminal or via startup command
# To auto-migrate on startup, change CMD to: ["sh", "-c", "npm run migrate || true && npm start"]
# Or use the start.sh script: CMD ["sh", "start.sh"]
CMD ["npm", "start"]

