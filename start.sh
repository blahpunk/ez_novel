#!/bin/bash

# Start EZ Novel backend API
echo "🔄 Starting backend API..."
cd /opt/ez_novel/server
pm2 start server.js --name ez-novel-api

# Start frontend static server via pm2 on port 7692
echo "🔄 Starting frontend..."
pm2 serve /opt/ez_novel/client/build 7692 --name ez-novel

# Save the process list for auto-restart
pm2 save
echo "✅ EZ Novel started."

