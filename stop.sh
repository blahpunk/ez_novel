#!/bin/bash

echo "🛑 Stopping EZ Novel services..."
pm2 stop ez-novel-api
pm2 stop ez-novel
echo "✅ Services stopped."

