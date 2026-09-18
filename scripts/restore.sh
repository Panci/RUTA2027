#!/bin/bash
# ==============================================================================
# RUTA 2027 - SCRIPT DE RESTAURACIÓN DE COPIA DE SEGURIDAD (DOKPLOY / VPS)
# ==============================================================================
set -e

if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar el archivo de backup a restaurar."
    echo "Uso: ./scripts/restore.sh ./backups/ruta2027_backup_YYYYMMDD_HHMMSS.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: El archivo ${BACKUP_FILE} no existe."
    exit 1
fi

echo "⚠️  ¡ATENCIÓN! La restauración sobrescribirá los datos actuales de la base de datos."
read -p "¿Estás seguro de que deseas continuar con la restauración? (escribe 'si' para confirmar): " CONFIRM

if [ "${CONFIRM}" != "si" ]; then
    echo "Operación cancelada por el usuario."
    exit 0
fi

echo "🔄 Restaurando base de datos desde ${BACKUP_FILE}..."

if docker ps | grep -q "ruta2027-postgres"; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i ruta2027-postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
    echo "✅ Restauración completada con éxito."
else
    echo "❌ Error: Contenedor 'ruta2027-postgres' no está en ejecución."
    exit 1
fi
