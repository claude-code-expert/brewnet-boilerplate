import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Brewnet — Next.js Full',
    description: 'Brewnet Next.js fullstack boilerplate with Server Components',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
