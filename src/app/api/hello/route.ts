import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Hello from Next.js!',
        lang: 'nodejs',
        version: process.version,
    });
}
