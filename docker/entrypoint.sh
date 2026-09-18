#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${DATABASE_URL#file:}" != "$DATABASE_URL" ]; then
  DB_FILE="${DATABASE_URL#file:}"
else
  DB_FILE="$DATABASE_PATH"
fi

mkdir -p "$(dirname "$DB_FILE")"
echo "[najih] app DB file: $DB_FILE (previous size: $(stat -c%s "$DB_FILE" 2>/dev/null || echo missing))"
cp /app/bundle/dev.db "$DB_FILE"
echo "[najih] replaced with bundle dev.db (size: $(stat -c%s "$DB_FILE"))"

echo "[najih] seeding + repairing DB ..."
DATABASE_PATH="$DB_FILE" node node_modules/tsx/dist/cli.mjs scripts/seed-sites.ts || echo "[najih] warning: seed/repair failed, continuing anyway"

exec node -e "process.env.HOSTNAME='0.0.0.0'; require('./server.js')"