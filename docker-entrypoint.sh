#!/bin/sh
set -e

echo "=================================================="
echo "🚀 [RUTA 2027] Iniciando contenedor de aplicación"
echo "=================================================="

# Sincronización y validación automática de la base de datos
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ [RUTA 2027] Esperando conexión con PostgreSQL y sincronizando esquema..."
  MAX_RETRIES=20
  RETRY_COUNT=0
  
  until npx prisma db push --skip-generate --accept-data-loss; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "❌ [RUTA 2027] Error: No se pudo conectar con la base de datos tras $MAX_RETRIES intentos."
      exit 1
    fi
    echo "⏳ Esperando 2 segundos para reintentar conexión con PostgreSQL ($RETRY_COUNT/$MAX_RETRIES)..."
    sleep 2
  done

  echo "✅ [RUTA 2027] Esquema de PostgreSQL sincronizado exitosamente."

  echo "🔍 [RUTA 2027] Verificando estado de los municipios en la base de datos..."
  node -e '
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    async function check() {
      try {
        const count = await prisma.campaign.count();
        if (count === 0) {
          process.exit(10);
        } else {
          console.log("✅ [RUTA 2027] Base de datos activa con " + count + " municipios indexados.");
          process.exit(0);
        }
      } catch (err) {
        console.error("⚠️ Error consultando campañas:", err.message);
        process.exit(10);
      } finally {
        await prisma.$disconnect();
      }
    }
    check();
  '
  CHECK_STATUS=$?

  if [ $CHECK_STATUS -eq 10 ]; then
    echo "🌱 [RUTA 2027] Base de datos vacía detectada."
    echo "📦 [RUTA 2027] Cargando los 68 municipios de Sevilla y creando usuarios del sistema..."
    npx tsx prisma/seed-all-68-municipios.ts
    echo "🎉 [RUTA 2027] Carga inicial de municipios y usuarios finalizada con éxito."
  fi
fi

echo "=================================================="
echo "✨ [RUTA 2027] Servidor listo. Arrancando Next.js en puerto ${PORT:-3000}..."
echo "=================================================="

exec "$@"
