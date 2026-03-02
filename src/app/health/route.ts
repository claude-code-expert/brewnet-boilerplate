import { NextResponse } from 'next/server';
import { checkDbConnection } from '@/lib/db';

export async function GET() {
    const dbConnected = await checkDbConnection();
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db_connected: dbConnected,
    });
}
