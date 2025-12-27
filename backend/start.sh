#!/bin/sh

# Startup script for backend
# This script runs migration before starting the server

echo "🚀 Starting backend server..."

# Run migrations (with error handling)
echo "📦 Running database migrations..."
npm run migrate || {
  echo "⚠️  Migration failed, but continuing startup..."
  echo "⚠️  You can run migration manually via: npm run migrate"
}

# Start server
echo "🌐 Starting Node.js server..."
exec npm start

