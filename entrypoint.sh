#!/bin/sh
if echo "$DATABASE_URL" | grep -q "^postgresql://"; then
  # Extract parts: postgresql://user:pass@host/db -> jdbc:postgresql://host:5432/db
  STRIPPED=$(echo "$DATABASE_URL" | sed 's|^postgresql://||')
  USERINFO=$(echo "$STRIPPED" | cut -d'@' -f1)
  HOSTDB=$(echo "$STRIPPED" | cut -d'@' -f2)
  HOST=$(echo "$HOSTDB" | cut -d'/' -f1)
  DB=$(echo "$HOSTDB" | cut -d'/' -f2)
  export DATABASE_URL="jdbc:postgresql://$HOST:5432/$DB"
  export DATABASE_USERNAME=$(echo "$USERINFO" | cut -d':' -f1)
  export DATABASE_PASSWORD=$(echo "$USERINFO" | cut -d':' -f2)
fi
exec java -jar /app/app.jar
