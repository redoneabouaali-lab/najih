#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${DATABASE_URL#file:}" != "$DATABASE_URL" ]; then
  DB_FILE="${DATABASE_URL#file:}"
else
  DB_FILE="$DATABASE_PATH"
fi

mkdir -p "$(dirname "$DB_FILE")"
# Only seed the DB when it is missing or unusable. Overwriting it on every start
# destroys content written at runtime (AI-generated questions) whenever the
# container is replaced.
if [ -s "$DB_FILE" ] && node -e "
const D=require('better-sqlite3');const d=new D(process.argv[1],{readonly:true});
const n=d.prepare(\"SELECT COUNT(*) n FROM Chapter\").get().n;d.close();
process.exit(n>0?0:1);
" "$DB_FILE" 2>/dev/null; then
  echo "[najih] existing DB preserved (size: $(stat -c%s "$DB_FILE"), chapters>0)"
else
  echo "[najih] no usable DB at $DB_FILE (previous size: $(stat -c%s "$DB_FILE" 2>/dev/null || echo missing)), seeding from bundle"
  cp /app/bundle/dev.db "$DB_FILE"
  echo "[najih] seeded dev.db (size: $(stat -c%s "$DB_FILE"))"
fi

echo "[najih] seeding + repairing DB ..."
DATABASE_PATH="$DB_FILE" node node_modules/tsx/dist/cli.mjs scripts/seed-sites.ts || echo "[najih] warning: seed/repair failed, continuing anyway"

exec node -e "process.env.HOSTNAME='0.0.0.0'; require('./server.js')"