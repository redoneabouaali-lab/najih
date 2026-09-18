#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${DATABASE_URL#file:}" != "$DATABASE_URL" ]; then
  DB_FILE="${DATABASE_URL#file:}"
else
  DB_FILE="$DATABASE_PATH"
fi

echo "[najih] app DB file: $DB_FILE"

if [ ! -f "$DB_FILE" ] && [ -n "$DATABASE_PATH" ] && [ "$DB_FILE" != "$DATABASE_PATH" ]; then
  cp /app/bundle/dev.db "$DB_FILE" 2>/dev/null || true
fi
if [ ! -f "$DB_FILE" ] && [ -f /app/bundle/dev.db ]; then
  cp /app/bundle/dev.db "$DB_FILE"
fi

echo "[najih] seeding + repairing DB ..."
DATABASE_PATH="$DB_FILE" node node_modules/tsx/dist/cli.mjs scripts/seed-sites.ts || echo "[najih] warning: seed/repair failed, continuing anyway"

exec node -e "process.env.HOSTNAME='0.0.0.0'; require('./server.js')"