#!/bin/sh
set -e

if [ ! -f "$DATABASE_PATH" ]; then
  cp /app/bundle/dev.db "$DATABASE_PATH"
fi

exec node server.js