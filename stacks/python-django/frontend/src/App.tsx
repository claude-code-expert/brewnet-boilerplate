import { useState, useEffect } from "react";

interface HealthResponse {
  status: string;
  timestamp: string;
  db_connected: boolean;
}

interface HelloResponse {
  message: string;
  lang: string;
  version: string;
}

export default function App() {
  const [hello, setHello] = useState<HelloResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((r) => r.json())
      .then(setHello)
      .catch(() => setError("Failed to connect to backend"));

    fetch("/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 600,
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>Brewnet</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {hello && (
        <p style={{ fontSize: "1.25rem" }}>
          {hello.message} ({hello.lang} {hello.version})
        </p>
      )}
      {health && (
        <p>
          DB: {health.db_connected ? "Connected" : "Disconnected"}
        </p>
      )}
      {!hello && !error && <p>Loading...</p>}
    </main>
  );
}
