#!/bin/bash
set -e

echo ""
echo "🧠 HireMind AI — Starting up..."
echo ""

# 1. Install dependencies if needed
if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
  echo "📦 Installing dependencies..."
  cd server && npm install && cd ..
  cd client && npm install && cd ..
  echo "✅ Dependencies installed"
fi

# 2. Setup .env files from examples if missing
if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  echo "📝 Created server/.env from example"
fi

if [ ! -f "client/.env" ]; then
  cp client/.env.example client/.env
  echo "📝 Created client/.env from example"
fi

# 3. Start MongoDB if not running
if command -v mongod &> /dev/null; then
  if ! pgrep -x mongod > /dev/null; then
    echo "🔄 Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || \
    mongod --dbpath /usr/local/var/mongodb --replSet rs0 --fork --logpath /usr/local/var/log/mongodb/mongod.log 2>/dev/null || \
    mongod --dbpath ~/data/db --replSet rs0 --fork --logpath ~/data/log/mongod.log 2>/dev/null || true
    sleep 2
  fi
  echo "✅ MongoDB running"
else
  echo "⚠️  MongoDB not found — install with: brew install mongodb-community"
  echo "   App will start but database features won't work."
fi

# 4. Generate Prisma client & push schema
echo "🔧 Setting up database..."
cd server
npx prisma generate --no-hints 2>/dev/null || true
npx prisma db push --skip-generate 2>/dev/null || echo "⚠️  DB push skipped — MongoDB may not be running"
cd ..

# 5. Start both server and client
echo ""
echo "🚀 Starting HireMind AI..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""

cd server && npx tsx watch src/server.ts &
SERVER_PID=$!
cd client && npx vite

kill $SERVER_PID 2>/dev/null
