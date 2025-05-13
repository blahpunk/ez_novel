#!/bin/bash
cd /opt/ez_novel/server

# Install any missing modules (safe to re-run)
npm install

# Start with PM2
pm2 start server.js --name ez-novel-api

# Ensure it starts on boot
pm2 startup
pm2 save

