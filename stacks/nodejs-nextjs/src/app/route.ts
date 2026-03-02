import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        service: 'nextjs-backend',
        status: 'running',
        message: 'Brewnet says hello!',
    });
}
