import { NextResponse } from 'next/server';
import { getHelloData } from '@/lib/hello';

export async function GET() {
    return NextResponse.json(getHelloData());
}
