import { getHelloData } from '@/lib/hello';
import HelloCard from '@/components/HelloCard';

// Server Component: fetches data at render time without client-side fetch
export default function Home() {
    const data = getHelloData();

    return (
        <main className="container">
            <a
                href="https://www.brewnet.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#f5a623", display: "flex", alignItems: "center", gap: 8, textDecoration: "none", justifyContent: "center", marginBottom: "0.5rem" }}
            >
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 26H32V34C32 36.8 29.8 39 27 39H13C10.2 39 8 36.8 8 34V26Z" strokeWidth="3.2" fill="none" />
                    <path d="M32 28.5C35.5 28.5 37 30.5 37 32.5C37 34.5 35.5 36.5 32 36.5" strokeWidth="3.2" fill="none" />
                    <circle cx="20" cy="30" r="1.8" fill="currentColor" stroke="none" />
                    <path d="M16.5 20a5 5 0 0 1 7 0" strokeWidth="3" fill="none" />
                    <path d="M13.5 15.5a10 10 0 0 1 13 0" strokeWidth="3" fill="none" />
                    <path d="M10.5 11a15 15 0 0 1 19 0" strokeWidth="3" fill="none" />
                </svg>
                <span style={{ display: "flex", flexDirection: "column", fontFamily: "'SF Mono', 'Fira Code', monospace", fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    Brewnet
                    <span style={{ display: "block", fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 400, color: "#888", letterSpacing: "0.02em", marginTop: 2 }}>
                        Your server on tap. Just brew it.
                    </span>
                </span>
            </a>
            <p className="subtitle">Next.js Full-Stack — Server Components + API Routes</p>
            <HelloCard data={data} />
        </main>
    );
}
