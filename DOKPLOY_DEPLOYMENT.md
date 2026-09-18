# Guía de Despliegue en Dokploy (Hostinger VPS) — Ruta 2027

Esta guía describe el procedimiento paso a paso para desplegar **Ruta 2027** en un VPS de Hostinger gestionado mediante Dokploy.

---

## 1. Requisitos Previos en el VPS
1. VPS de Hostinger con Ubuntu 22.04 / 24.04 LTS y Dokploy instalado (`curl -sSL https://dokploy.com/install.sh | sh`).
2. Dominio apuntando a la IP pública del VPS mediante un registro DNS tipo `A` (ej. `campana.tudominio.es`).
3. Puertos `80`, `443` y `3000` abiertos en el cortafuegos de Hostinger / UFW.

---

## 2. Configuración en Dokploy

### Opción A: Despliegue mediante Docker Compose (Recomendada)
1. En el panel de Dokploy, entra en tu proyecto y selecciona **Create Service** → **Compose**.
2. Asigna un nombre (ej. `ruta2027-prod`).
3. En la pestaña **Source**, selecciona tu repositorio de GitHub / GitLab y la rama `main` (o `staging` para el entorno de pruebas).
4. Configura la ruta del archivo Compose: `docker-compose.production.yml`.
5. En la pestaña **Environment Variables**, define las siguientes variables:
   ```env
   NODE_ENV=production
   POSTGRES_USER=ruta2027_admin
   POSTGRES_PASSWORD=PonUnaPasswordSuperSeguraAqui2027!
   POSTGRES_DB=ruta2027_db
   APP_DOMAIN=campana.tudominio.es
   APP_PORT=3000
   NEXTAUTH_SECRET=genera_un_hash_largo_con_openssl_rand_hex_32
   NEXTAUTH_URL=https://campana.tudominio.es
   BACKUP_KEEP_DAYS=14
   ```
6. Haz clic en **Deploy**. Dokploy descargará el código, construirá la imagen multi-stage, inicializará PostgreSQL con volumen persistente (`ruta2027_postgres_data`) y levantará el proxy inverso Traefik con certificado SSL Let's Encrypt automático.

### Opción B: Despliegue de Staging independiente
1. Crea un segundo servicio Compose en Dokploy llamado `ruta2027-staging`.
2. Asocia la rama `develop` o `staging`.
3. Configura variables independientes (ej. `APP_DOMAIN=staging-campana.tudominio.es`, `POSTGRES_DB=ruta2027_staging`).
4. Ambos entornos convivirán en contenedores y bases de datos completamente aisladas.

---

## 3. Inicialización y Migraciones de Base de Datos
Dokploy ejecuta la app Next.js en el contenedor `ruta2027-app`. Para sincronizar el esquema y cargar la semilla con los datos iniciales de demostración:

```bash
# Entrar a la terminal del contenedor o ejecutar desde el host:
docker exec -it ruta2027-app npx prisma db push
docker exec -it ruta2027-app npm run db:seed
```

---

## 4. Comprobación de Salud y Monitorización
La aplicación cuenta con el endpoint `/api/health` que comprueba:
- Estado del servidor HTTP.
- Conectividad y respuesta de PostgreSQL.
- Uso de memoria RAM y tiempo de actividad (`uptime`).

Puedes verificar el estado en cualquier momento con:
```bash
curl -I https://campana.tudominio.es/api/health
```
Respuesta esperada: `HTTP/2 200 OK` con JSON `{"status":"ok","database":"connected"}`.

---

## 5. Copias de Seguridad y Restauración

### Copias automáticas
El servicio `postgres-backup` en `docker-compose.production.yml` ejecuta una copia comprimida diaria (`pg_dump | gzip`) a las 03:00 AM y conserva los últimos 14 días en el volumen `./backups`.

### Copia manual inmediata
```bash
./scripts/backup.sh
```

### Restauración de una copia
```bash
./scripts/restore.sh ./backups/ruta2027_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## 6. Procedimiento de Actualización y Rollback
1. **Actualización estándar**: Al hacer push a la rama `main`, Dokploy detectará el cambio y realizará un zero-downtime redeploy. Los datos persisten intactos en el volumen `postgres_data`.
2. **Rollback en caso de incidencia**: En Dokploy, ve a la pestaña **Deployments**, localiza el commit anterior estable y haz clic en **Redeploy**.
