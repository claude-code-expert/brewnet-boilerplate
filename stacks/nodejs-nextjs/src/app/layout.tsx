import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Brewnet — Your Server on Tap. Just Brew It.',
    description: 'Self-hosted home server management platform. Deploy Git, DB, File, Media servers with one command. 6 languages, 16 frameworks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body>{children}</body>
        </html>
    );
}
