#!/bin/bash
set -e

echo ""
echo "🧠 HireMind AI — Starting up..."
echo ""

# 1. Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# 2. Setup .env files if missing
if [ ! -f "server/.env" ]; then
  if [ -f "server/.env.example" ]; then
    cp server/.env.example server/.env
    echo "📝 Created server/.env from .env.example — edit it with your keys"
  fi
fi

if [ ! -f "client/.env" ]; then
  if [ -f "client/.env.example" ]; then
    cp client/.env.example client/.env
    echo "📝 Created client/.env from .env.example"
  fi
fi

# 3. Start MongoDB if not running
if command -v mongod &> /dev/null; then
  if ! pgrep -x mongod > /dev/null; then
    echo "🔄 Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || \
    mongod --dbpath /usr/local/var/mongodb --replSet rs0 --fork --logpath /usr/local/var/log/mongodb/mongod.log 2>/dev/null || \
    mongod --dbpath ~/data/db --replSet rs0 --fork --logpath ~/data/log/mongod.log 2>/dev/null || \
    echo "⚠️  Could not auto-start MongoDB. Please start it manually."
    sleep 2
  fi
  echo "✅ MongoDB is running"
else
  echo "⚠️  MongoDB not found. Install it: brew install mongodb-community"
fi

# 4. Generate Prisma client & push schema
echo "🔧 Setting up database..."
cd server
npx prisma generate --no-hints 2>/dev/null
npx prisma db push --skip-generate 2>/dev/null || echo "⚠️  DB push failed — check your DATABASE_URL in server/.env"
cd ..

# 5. Start both server and client
echo ""
echo "🚀 Starting server (port 5001) and client (port 3000)..."
echo ""

# Run server in background, client in foreground
cd server && npx tsx watch src/server.ts &
SERVER_PID=$!

cd client && npx vite

# Cleanup on exit
kill $SERVER_PID 2>/dev/null
