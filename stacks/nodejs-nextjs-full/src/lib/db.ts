import { PrismaClient } from '@prisma/client';

function buildDatabaseUrl(): string {
    const driver = process.env.DB_DRIVER || 'postgres';
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    switch (driver) {
        case 'mysql':
            return `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST || 'mysql'}:${process.env.MYSQL_PORT || '3306'}/${process.env.MYSQL_DATABASE || 'brewnet_db'}`;
        case 'sqlite3':
            return `file:${process.env.SQLITE_PATH || '/app/data/brewnet_db.db'}`;
        default:
            return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'postgres'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'brewnet_db'}`;
    }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: { db: { url: buildDatabaseUrl() } },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function checkDbConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch {
        return false;
    }
}
