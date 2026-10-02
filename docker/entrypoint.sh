#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${DATABASE_URL#file:}" != "$DATABASE_URL" ]; then
  DB_FILE="${DATABASE_URL#file:}"
else
  DB_FILE="$DATABASE_PATH"
fi

mkdir -p "$(dirname "$DB_FILE")"

# Validate with the SQLite file header only. Node's top-level better-sqlite3
# binary segfaults in this image (Prisma carries its own working nested copy),
# so a node-based check would always fail and wipe the database.
is_sqlite_db() {
  [ -f "$1" ] || return 1
  [ "$(stat -c%s "$1" 2>/dev/null || echo 0)" -gt 1024 ] || return 1
  [ "$(head -c 16 "$1" 2>/dev/null)" = "SQLite format 3" ]
}

if is_sqlite_db "$DB_FILE"; then
  echo "[najih] existing DB preserved (size: $(stat -c%s "$DB_FILE"))"
else
  echo "[najih] no usable DB at $DB_FILE (previous size: $(stat -c%s "$DB_FILE" 2>/dev/null || echo missing)), seeding from bundle"
  rm -f "$DB_FILE" "$DB_FILE-shm" "$DB_FILE-wal"
  cp /app/bundle/dev.db "$DB_FILE"
  echo "[najih] seeded dev.db (size: $(stat -c%s "$DB_FILE"))"
fi

echo "[najih] seeding + repairing DB ..."
DATABASE_PATH="$DB_FILE" node node_modules/tsx/dist/cli.mjs scripts/seed-sites.ts || echo "[najih] warning: seed/repair failed, continuing anyway"

exec node -e "process.env.HOSTNAME='0.0.0.0'; require('./server.js')"