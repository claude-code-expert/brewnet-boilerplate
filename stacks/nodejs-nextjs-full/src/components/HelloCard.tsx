'use client';

import { useState } from 'react';
import type { HelloData } from '@/lib/hello';

export default function HelloCard({ data }: { data: HelloData }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="card">
            <div className="card-row">
                <span className="card-label">message</span>
                <span className="card-value">{data.message}</span>
            </div>
            <div className="card-row">
                <span className="card-label">lang</span>
                <span className="card-value">{data.lang}</span>
            </div>
            <div className="card-row">
                <span className="card-label">version</span>
                <span className="card-value">{data.version}</span>
            </div>
            <div className="card-footer">
                <button onClick={handleCopy}>
                    {copied ? '✓ Copied!' : 'Copy JSON'}
                </button>
            </div>
        </div>
    );
}
