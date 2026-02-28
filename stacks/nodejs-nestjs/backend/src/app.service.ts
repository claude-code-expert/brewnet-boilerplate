import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) {}

    async getHealth() {
        const dbConnected = await this.prisma.checkConnection();
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            db_connected: dbConnected,
        };
    }
}
