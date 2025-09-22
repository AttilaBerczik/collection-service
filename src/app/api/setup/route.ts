import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';
import { initializeDatabase, seedDatabase } from '../../../lib/schema';

export async function POST() {
  try {
    // First, test the database connection
    console.log('Testing database connection...');
    const connectionTest = await db.testConnection();

    if (!connectionTest) {
      return NextResponse.json({
        error: 'Failed to connect to database. Please check your connection settings and ensure your IP is whitelisted in Azure.'
      }, { status: 500 });
    }

    console.log('Database connection successful, initializing schema...');
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      return NextResponse.json({ error: 'Failed to initialize database schema' }, { status: 500 });
    }

    console.log('Schema initialized, seeding data...');
    const dbSeeded = await seedDatabase();
    if (!dbSeeded) {
      return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Database initialized and seeded successfully' });
  } catch (error) {
    console.error('Database setup error:', error);

    // Type guard to check if error has the expected properties
    const isPostgresError = (err: unknown): err is { code: string; message: string } => {
      return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
    };

    // Provide specific error messages based on error type
    if (isPostgresError(error)) {
      if (error.code === '28P01') {
        return NextResponse.json({
          error: 'Authentication failed. Please check your database password and ensure your user has the correct permissions.'
        }, { status: 500 });
      } else if (error.code === 'ENOTFOUND') {
        return NextResponse.json({
          error: 'Database server not found. Please check your database host address.'
        }, { status: 500 });
      } else if (error.code === 'ECONNREFUSED') {
        return NextResponse.json({
          error: 'Connection refused. Please check if your database server is running and accessible.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: `Database setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: isPostgresError(error) ? error.code : undefined
    }, { status: 500 });
  }
}
