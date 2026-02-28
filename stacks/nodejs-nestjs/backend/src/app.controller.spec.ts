import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

describe('API Endpoints', () => {
    let app: INestApplication;

    // Mock PrismaService to avoid real DB connections
    const mockPrismaService = {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $queryRaw: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        checkConnection: jest.fn().mockResolvedValue(false),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrismaService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    test('GET / returns service info', async () => {
        const res = await request(app.getHttpServer()).get('/');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('service', 'nestjs-backend');
        expect(res.body).toHaveProperty('status', 'running');
        expect(res.body).toHaveProperty('message');
    });

    test('GET /health returns ok', async () => {
        const res = await request(app.getHttpServer()).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
    });

    test('GET /api/hello returns greeting', async () => {
        const res = await request(app.getHttpServer()).get('/api/hello');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Hello from NestJS!');
        expect(res.body).toHaveProperty('lang', 'nodejs');
        expect(res.body).toHaveProperty('version');
    });

    test('POST /api/echo echoes body', async () => {
        const payload = { test: 'brewnet' };
        const res = await request(app.getHttpServer())
            .post('/api/echo')
            .send(payload)
            .set('Content-Type', 'application/json');
        expect(res.status).toBe(201);
        expect(res.body).toEqual(payload);
    });
});
