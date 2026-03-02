export interface HelloData {
    message: string;
    lang: string;
    version: string;
}

export function getHelloData(): HelloData {
    return {
        message: 'Hello from Next.js!',
        lang: 'nodejs',
        version: process.version,
    };
}
