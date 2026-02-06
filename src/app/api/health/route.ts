import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const requiredEnvVars = {
  critical: ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
  important: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ],
};

export async function GET() {
  const errors: string[] = [];
  const warnings: string[] = [];
  let databaseStatus = 'disconnected';

  // Check environment variables
  for (const varName of requiredEnvVars.critical) {
    if (!process.env[varName]) {
      errors.push(`Missing critical: ${varName}`);
    }
  }

  for (const varName of requiredEnvVars.important) {
    if (!process.env[varName]) {
      warnings.push(`Missing important: ${varName}`);
    }
  }

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'connected';
  } catch (error) {
    errors.push(`Database error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  const hasErrors = errors.length > 0;
  
  return NextResponse.json(
    { 
      status: hasErrors ? 'error' : 'ok',
      database: databaseStatus,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    { status: hasErrors ? 500 : 200 }
  );
}
