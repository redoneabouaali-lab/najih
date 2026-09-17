#!/bin/sh
set -e

if [ ! -f "$DATABASE_PATH" ]; then
  cp /app/bundle/dev.db "$DATABASE_PATH"
fi

exec node -e "process.env.HOSTNAME='0.0.0.0'; require('./server.js')"