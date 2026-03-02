"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StackInfo, Language } from "@/lib/types";
import FilterBar from "./FilterBar";
import StackCard from "./StackCard";

const POLL_INTERVAL = 5000;

function BrewnetLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#f5a623" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 26H32V34C32 36.8 29.8 39 27 39H13C10.2 39 8 36.8 8 34V26Z" strokeWidth="3.2" fill="none" />
      <path d="M32 28.5C35.5 28.5 37 30.5 37 32.5C37 34.5 35.5 36.5 32 36.5" strokeWidth="3.2" fill="none" />
      <circle cx="20" cy="30" r="1.8" fill="#f5a623" stroke="none" />
      <path d="M16.5 20a5 5 0 0 1 7 0" strokeWidth="3" fill="none" />
      <path d="M13.5 15.5a10 10 0 0 1 13 0" strokeWidth="3" fill="none" />
      <path d="M10.5 11a15 15 0 0 1 19 0" strokeWidth="3" fill="none" />
    </svg>
  );
}

export default function Dashboard() {
  const [stacks, setStacks] = useState<StackInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Language | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStacks = useCallback(async () => {
    try {
      const res = await fetch("/api/stacks");
      const data: StackInfo[] = await res.json();
      setStacks(data);
    } catch {
      // keep existing data on transient error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);

  // Poll running stacks
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      const runningNames = stacks
        .filter((s) => s.status === "running" || s.status === "starting")
        .map((s) => s.name);

      if (runningNames.length === 0) return;

      const updates = await Promise.all(
        runningNames.map(async (name) => {
          const res = await fetch(`/api/stacks/${name}/status`);
          return { name, data: await res.json() };
        })
      );

      setStacks((prev) =>
        prev.map((s) => {
          const update = updates.find((u) => u.name === s.name);
          if (!update) return s;
          return { ...s, status: update.data.status, ports: update.data.ports ?? s.ports };
        })
      );
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [stacks]);

  async function handleStart(name: string) {
    setStacks((prev) =>
      prev.map((s) => (s.name === name ? { ...s, status: "starting" } : s))
    );
    try {
      const res = await fetch(`/api/stacks/${name}/start`, { method: "POST" });
      const data = await res.json();
      if (data.ports) {
        setStacks((prev) =>
          prev.map((s) => (s.name === name ? { ...s, ports: data.ports, status: "starting" } : s))
        );
      }
    } catch {
      setStacks((prev) =>
        prev.map((s) => (s.name === name ? { ...s, status: "error" } : s))
      );
    }
  }

  async function handleStop(name: string) {
    setStacks((prev) =>
      prev.map((s) => (s.name === name ? { ...s, status: "stopping" } : s))
    );
    try {
      await fetch(`/api/stacks/${name}/stop`, { method: "POST" });
    } finally {
      setStacks((prev) =>
        prev.map((s) => (s.name === name ? { ...s, status: "stopped", ports: null } : s))
      );
    }
  }

  const filtered = filter ? stacks.filter((s) => s.language === filter) : stacks;

  const counts = stacks.reduce<Record<string, number>>((acc, s) => {
    acc[s.language] = (acc[s.language] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <BrewnetLogo />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em", color: "#f5a623", lineHeight: 1 }}>
            Brewnet
          </span>
          <span style={{ fontFamily: "var(--font)", fontSize: 10, fontWeight: 400, color: "#ffffff", letterSpacing: "0.02em", marginTop: 2 }}>
            Your server on tap. Just brew it.
          </span>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {stacks.filter((s) => s.status === "running").length} running ·{" "}
            {stacks.length} stacks total
          </p>
        </div>
        <button
          onClick={fetchStacks}
          style={{ marginLeft: "auto", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 13 }}
        >
          ↺ Refresh
        </button>
      </div>

      {/* Filter */}
      <FilterBar selected={filter} onChange={setFilter} counts={counts} />

      {/* Grid */}
      {loading ? (
        <div style={{ color: "var(--muted)", textAlign: "center", marginTop: 60, fontSize: 14 }}>
          Loading stacks…
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}>
          {filtered.map((stack) => (
            <StackCard
              key={stack.name}
              stack={stack}
              onStart={handleStart}
              onStop={handleStop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
