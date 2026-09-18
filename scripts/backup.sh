#!/bin/bash
# ==============================================================================
# RUTA 2027 - SCRIPT DE COPIA DE SEGURIDAD MANUAL (DOKPLOY / VPS HOSTINGER)
# ==============================================================================
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/manual_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "📦 Iniciando copia de seguridad manual de la base de datos Ruta 2027..."

if docker ps | grep -q "ruta2027-postgres"; then
    echo "🐳 Ejecutando pg_dump en el contenedor ruta2027-postgres..."
    docker exec -t ruta2027-postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' | gzip > "${FILENAME}"
    echo "✅ Copia de seguridad completada con éxito: ${FILENAME}"
    echo "📊 Tamaño del archivo: $(du -h "${FILENAME}" | cut -f1)"
else
    echo "⚠️ Contenedor 'ruta2027-postgres' no encontrado en ejecución."
    echo "Asegúrate de que los contenedores están corriendo con: docker compose -f docker-compose.production.yml up -d"
    exit 1
fi
