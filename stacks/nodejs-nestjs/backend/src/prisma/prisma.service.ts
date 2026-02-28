import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function buildDatabaseUrl(): string {
    const driver = process.env.DB_DRIVER || 'postgres';
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    switch (driver) {
        case 'mysql':
            return `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST || 'mysql'}:${process.env.MYSQL_PORT || '3306'}/${process.env.MYSQL_DATABASE || 'brewnet'}`;
        case 'sqlite3':
            return `file:${process.env.SQLITE_PATH || '/app/data/brewnet.db'}`;
        default:
            return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'postgres'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'brewnet'}`;
    }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private connected = false;

    constructor() {
        const url = buildDatabaseUrl();
        super({ datasources: { db: { url } } });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.connected = true;
        } catch (e) {
            console.warn('Warning: DB connection failed:', e);
            this.connected = false;
        }
    }

    async onModuleDestroy() {
        if (this.connected) {
            await this.$disconnect();
        }
    }

    async checkConnection(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}
