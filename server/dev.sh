#!/bin/bash

# Auto-start MongoDB if not running
if ! pgrep -x mongod > /dev/null; then
  echo "🔄 MongoDB not running. Starting it..."
  brew services start mongodb-community 2>/dev/null || mongod --dbpath /usr/local/var/mongodb --replSet rs0 --fork --logpath /usr/local/var/log/mongodb/mongod.log 2>/dev/null || mongod --dbpath ~/data/db --replSet rs0 --fork --logpath ~/data/log/mongod.log 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "✅ MongoDB started successfully"
    sleep 2
  else
    echo "❌ Failed to start MongoDB. Please start it manually."
    exit 1
  fi
else
  echo "✅ MongoDB is already running"
fi

# Start the server
npx tsx watch src/server.ts
