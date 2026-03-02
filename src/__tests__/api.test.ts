import { describe, test, expect, vi } from 'vitest';

// Mock the database module to avoid requiring a real DB connection
vi.mock('@/lib/db', () => ({
    prisma: {},
    checkDbConnection: vi.fn().mockResolvedValue(false),
}));

// Mock next/server NextResponse to use standard Response in test env
vi.mock('next/server', () => ({
    NextResponse: {
        json: (body: unknown, init?: ResponseInit) => {
            return new Response(JSON.stringify(body), {
                status: init?.status ?? 200,
                headers: { 'Content-Type': 'application/json' },
            });
        },
    },
}));

describe('API Endpoints', () => {
    test('GET / returns service info', async () => {
        const { GET } = await import('@/app/route');
        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body).toHaveProperty('service', 'nextjs-backend');
        expect(body).toHaveProperty('status', 'running');
        expect(body).toHaveProperty('message');
    });

    test('GET /health returns ok', async () => {
        const { GET } = await import('@/app/health/route');
        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body).toHaveProperty('status', 'ok');
        expect(body).toHaveProperty('timestamp');
    });

    test('GET /api/hello returns greeting', async () => {
        const { GET } = await import('@/app/api/hello/route');
        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body).toHaveProperty('message', 'Hello from Next.js!');
        expect(body).toHaveProperty('lang', 'nodejs');
        expect(body).toHaveProperty('version');
    });

    test('POST /api/echo echoes body', async () => {
        const { POST } = await import('@/app/api/echo/route');
        const payload = { test: 'brewnet' };
        const req = new Request('http://localhost/api/echo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const res = await POST(req);
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body).toEqual(payload);
    });
});
