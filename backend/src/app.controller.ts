import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    root() {
        return {
            service: 'nestjs-backend',
            status: 'running',
            message: 'Hello Brewnet (https://www.brewnet.dev)',
        };
    }

    @Get('health')
    async health() {
        return this.appService.getHealth();
    }

    @Get('api/hello')
    hello() {
        return {
            message: 'Hello from NestJS!',
            lang: 'nodejs',
            version: process.version,
        };
    }

    @Post('api/echo')
    echo(@Body() body: any) {
        return body || {};
    }
}
