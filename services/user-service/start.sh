#!/bin/sh

echo "🔄 Setting up database..."
npx prisma db push --skip-generate || echo "⚠️  Database setup failed, continuing..."
echo "🚀 Starting user service..."
npm start
