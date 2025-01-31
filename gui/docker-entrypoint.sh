#!/bin/bash
set -e

echo "Install packages..."
npm i
echo "Package installation complete!"

echo "Building application..."
npm run build
echo "Application build complete!"

if [ "$NODE_ENV" = "production" ]; then
  echo "Production environment detected, serving the app..."
  npm i -g serve@14.2.4
  serve -s dist
else
  echo "Non-production environment detected, tailing /dev/null..."
  npm i -g pm2@5.4.3
  pm2 start --name "ptc-dashboard" npm -- run start
  pm2 logs
  tail -f /dev/null
fi
