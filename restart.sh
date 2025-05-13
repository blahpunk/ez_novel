#!/bin/bash

echo "🔁 Restarting EZ Novel services..."

# Stop both services if running
pm2 stop ez-novel-api
pm2 stop ez-novel

# Start backend API
echo "▶️ Starting backend API..."
cd /opt/ez_novel/server
pm2 start server.js --name ez-novel-api

# Start frontend static server
echo "▶️ Starting frontend..."
pm2 serve /opt/ez_novel/client/build 7692 --name ez-novel

# Save updated process list
pm2 save

echo "✅ Restart complete."

