#!/bin/sh
if echo "$DATABASE_URL" | grep -q "^postgresql://"; then
  export DATABASE_URL="jdbc:postgresql://$(echo "$DATABASE_URL" | sed 's|^postgresql://||')"
fi
exec java -jar /app/app.jar
