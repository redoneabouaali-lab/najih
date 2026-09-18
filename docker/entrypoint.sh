#!/bin/sh
set -e

if [ ! -f "$DATABASE_PATH" ]; then
  cp /app/bundle/dev.db "$DATABASE_PATH"
fi

echo "[najih] seeding + repairing DB ($DATABASE_PATH) ..."
node node_modules/tsx/dist/cli.mjs scripts/seed-sites.ts || echo "[najih] warning: seed/repair failed, continuing anyway"

exec node -e "process.env.HOSTNAME='0.0.0.0'; require('./server.js')"