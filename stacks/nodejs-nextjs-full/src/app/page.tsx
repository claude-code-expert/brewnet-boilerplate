import { getHelloData } from '@/lib/hello';
import HelloCard from '@/components/HelloCard';

// Server Component: fetches data at render time without client-side fetch
export default function Home() {
    const data = getHelloData();

    return (
        <main className="container">
            <h1>🍺 Brewnet</h1>
            <p className="subtitle">Next.js Full-Stack — Server Components + API Routes</p>
            <HelloCard data={data} />
        </main>
    );
}
