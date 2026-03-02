"use client";

import { useState } from "react";
import type { StackInfo } from "@/lib/types";

interface ApiCall {
  method: string;
  endpoint: string;
  hasBody: boolean;
  label: string;
}

const API_CALLS: ApiCall[] = [
  { method: "GET", endpoint: "/", hasBody: false, label: "GET /" },
  { method: "GET", endpoint: "/health", hasBody: false, label: "GET /health" },
  { method: "GET", endpoint: "/api/hello", hasBody: false, label: "GET /api/hello" },
  { method: "POST", endpoint: "/api/echo", hasBody: true, label: "POST /api/echo" },
];

interface ResultState {
  ok: boolean;
  status: number;
  data: unknown;
  durationMs: number;
  error?: string;
}

export default function ApiExplorer({ stack }: { stack: StackInfo }) {
  const [bodies, setBodies] = useState<Record<string, string>>({
    "/api/echo": '{"message":"hello"}',
  });
  const [results, setResults] = useState<Record<string, ResultState | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function callEndpoint(call: ApiCall) {
    setLoading((p) => ({ ...p, [call.endpoint]: true }));
    setResults((p) => ({ ...p, [call.endpoint]: null }));
    try {
      const res = await fetch(`/api/stacks/${stack.name}/proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: call.endpoint,
          method: call.method,
          body: call.hasBody ? bodies[call.endpoint] : undefined,
        }),
      });
      const data = await res.json();
      setResults((p) => ({ ...p, [call.endpoint]: data }));
    } catch (err) {
      setResults((p) => ({
        ...p,
        [call.endpoint]: {
          ok: false,
          status: 0,
          data: null,
          durationMs: 0,
          error: err instanceof Error ? err.message : String(err),
        },
      }));
    } finally {
      setLoading((p) => ({ ...p, [call.endpoint]: false }));
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        API Explorer
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {API_CALLS.map((call) => {
          const result = results[call.endpoint];
          const isLoading = loading[call.endpoint];
          return (
            <div key={call.endpoint} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: call.hasBody ? 6 : 0 }}>
                <span style={{
                  background: call.method === "GET" ? "#1e3a5f" : "#2d1e3a",
                  color: call.method === "GET" ? "#7dd3fc" : "#c4b5fd",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontFamily: "var(--mono)",
                }}>
                  {call.method}
                </span>
                <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text)", flex: 1 }}>
                  {call.endpoint}
                </span>
                <button
                  onClick={() => callEndpoint(call)}
                  disabled={isLoading}
                  style={{
                    background: "var(--primary)",
                    color: "#0f172a",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                  }}
                >
                  {isLoading ? "..." : "▶"}
                </button>
              </div>
              {call.hasBody && (
                <textarea
                  value={bodies[call.endpoint] ?? ""}
                  onChange={(e) => setBodies((p) => ({ ...p, [call.endpoint]: e.target.value }))}
                  rows={2}
                  style={{
                    width: "100%",
                    background: "#0a1628",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text)",
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    padding: "4px 8px",
                    resize: "vertical",
                    marginBottom: 4,
                  }}
                />
              )}
              {result && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: result.ok ? "var(--success)" : "var(--error)",
                    }}>
                      {result.status > 0 ? result.status : "ERR"}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{result.durationMs}ms</span>
                  </div>
                  <pre style={{ margin: 0, fontSize: 11, maxHeight: 150, overflowY: "auto" }}>
                    {result.error ?? JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
