export const metadata = {
    title: 'Brewnet — Next.js',
    description: 'Brewnet Next.js fullstack boilerplate',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
