#!/bin/sh
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
BACKUP_FILE="${BACKUP_DIR}/ruta2027_backup_${DATE}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Iniciando copia de seguridad programada de ${POSTGRES_DB}..."

PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[$(date)] Copia guardada con éxito en ${BACKUP_FILE}"

# Rotación de copias antiguas (eliminar copias más antiguas que BACKUP_KEEP_DAYS)
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
echo "[$(date)] Limpiando copias de seguridad anteriores a ${KEEP_DAYS} días..."
find "${BACKUP_DIR}" -type f -name "ruta2027_backup_*.sql.gz" -mtime +${KEEP_DAYS} -delete

echo "[$(date)] Proceso de copia de seguridad finalizado correctamente."
