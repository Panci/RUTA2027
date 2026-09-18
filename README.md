# Ruta 2027 — Plataforma Estratégica de Campaña Municipal

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![Dokploy](https://img.shields.io/badge/Deploy-Dokploy%20VPS-8A2BE2)](https://dokploy.com/)

**Ruta 2027** es una aplicación web integral en español diseñada para planificar, ejecutar y monitorizar la estrategia de una campaña municipal hacia las **elecciones de mayo de 2027**.

La plataforma no promete resultados electorales milagrosos, sino que proporciona al equipo de campaña el marco metodológico y las herramientas analíticas para responder de forma continua:
1. **¿Dónde somos fuertes?**
2. **¿Dónde son fuertes los demás?**
3. **¿Dónde podemos crecer?**
4. **¿Qué público necesitamos movilizar?**
5. **¿Qué prioridad debemos trabajar?**
6. **¿Qué acción concreta debemos realizar esta semana?**

---

## 🚀 Lógica Central de la Aplicación

```
Diagnóstico → Análisis electoral → Competencia → Objetivo → Público prioritario → Tres prioridades → Estrategia por distrito → Plan de actuación → Seguimiento semanal
```

---

## 💻 Módulos y Pantallas Incluidas

- 📅 **Panel "Esta Semana"**: Tablero de mando operativo con tareas semanales, actos, hitos próximos, radar de rivales y disciplina de mensaje.
- 📊 **Resultados Electorales 2023 & Importador**: Escrutinio consolidado, comparativas por distrito e importador interactivo de actas en **CSV y Excel (.xlsx)** con validación y corrección de discrepancias.
- 👥 **Partidos y Candidaturas**: Fichas de todas las fuerzas concurrentes con rigurosa separación entre *Datos confirmados*, *Información pública*, *Valoración interna* e *Hipótesis de trabajo*.
- 📍 **Análisis por Distritos**: Matriz de competitividad frente a la media municipal y clasificación estratégica editable (*Fortaleza, Crecimiento, Defensa, Oportunidad, etc.*).
- 🧮 **Simulación Electoral D'Hondt**: Simulador interactivo de reparto de concejales con barrera electoral legal (5%) y advertencias metodológicas explícitas.
- 🧭 **Diagnóstico DAFO**: Matriz estratégica de 4 cuadrantes, análisis de problemas ciudadanos y capacidades reales del equipo.
- 🎯 **Objetivo, Público y Tres Prioridades**: Consagración de las 3 batallas políticas irrenunciables a las que deben vincularse todas las acciones.
- 🗺️ **Hoja de Ruta (2026-2027)**: Cronograma en 7 fases estratégicas desde septiembre de 2026 hasta la movilización final de mayo de 2027.
- 📣 **Actos y Visitas de Calle**: Registro de presencia territorial vinculada a distrito, público objetivo y mensaje central.
- 💬 **Banco de Mensajes y Argumentario**: Argumentarios, réplicas a ataques y respuestas a preguntas frecuentes (FAQs).
- 👁️ **Radar de Competidores**: Detección de declaraciones, errores públicos y oportunidades de diferenciación.
- 📋 **Seguimiento y Reuniones**: Actas oficiales de reuniones de comité de campaña e informe semanal ejecutivo.
- 📈 **Cuadro de Mando (KPIs)**: Indicadores internos de cumplimiento de tareas, hitos y penetración territorial.
- 🐳 **Despliegue Dokploy VPS**: Guía interactiva y comandos de administración para Hostinger VPS.

---

## 🛠️ Requisitos e Instalación Local

### Requisitos previos
- Node.js 18+ (recomendado Node 20 o superior).
- npm 9+.

### Puesta en marcha en 3 pasos:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Inicializar base de datos y cargar campaña de demostración (Valle Real)**:
   ```bash
   npx prisma db push
   npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Pruebas Automatizadas

El proyecto incluye tests unitarios para verificar el reparto electoral D'Hondt y el umbral del 5%:

```bash
npm test
```

---

## 🚢 Despliegue en VPS Hostinger con Dokploy

La aplicación está lista para ejecutarse en producción en tu propio servidor VPS utilizando **Dokploy** y **Docker Compose**:

- `Dockerfile`: Construcción multi-stage optimizada en modo Next.js `standalone`.
- `docker-compose.production.yml`:
  - Contenedor web Next.js (`ruta2027-app`).
  - Base de datos PostgreSQL 16 con volumen persistente (`postgres_data`).
  - Servicio cron de copias de seguridad automáticas diarias (`postgres-backup`) con compresión gzip y retención de 14 días.
  - Proxy inverso Traefik con SSL automático (Let's Encrypt).
- Endpoint de monitorización y salud activo en: `/api/health`.

Consulta la guía paso a paso completa en:
👉 [DOKPLOY_DEPLOYMENT.md](DOKPLOY_DEPLOYMENT.md)

---

## 🔒 Privacidad y Cumplimiento Normativo (RGPD y LOREG)

- Todos los datos electorales utilizados son **agregados a nivel municipal, de distrito o mesa electoral**.
- La aplicación **no realiza perfiles políticos individuales** ni almacena datos sensibles no autorizados.
- Contraseñas cifradas mediante `bcrypt`, sesiones protegidas y variables de entorno excluidas del control de versiones.
