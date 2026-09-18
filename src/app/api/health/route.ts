import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    // Comprobación rápida de conectividad a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error: any) {
    dbStatus = 'error';
    dbError = error?.message || 'Database connection error';
  }

  const responseTimeMs = Date.now() - startTime;
  const memory = process.memoryUsage();

  const healthData = {
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    service: 'Ruta 2027 - Plataforma de Campaña Municipal',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      responseTimeMs,
      error: dbError,
    },
    system: {
      memoryRssMB: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMB: Math.round(memory.heapUsed / (1024 * 1024)),
      nodeVersion: process.version,
    },
  };

  const httpStatus = dbStatus === 'connected' ? 200 : 503;

  return NextResponse.json(healthData, { status: httpStatus });
}
