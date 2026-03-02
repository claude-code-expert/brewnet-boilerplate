"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StackInfo, Language } from "@/lib/types";
import FilterBar from "./FilterBar";
import StackCard from "./StackCard";

const POLL_INTERVAL = 5000;

function BrewnetLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#38bdf8" />
      <path d="M8 22V10h4c2.2 0 3.5 1.2 3.5 3 0 1-.5 1.8-1.3 2.3C15.5 15.8 16 16.8 16 18c0 2.2-1.4 4-4 4H8zm2.5-7.5h1.8c.9 0 1.4-.5 1.4-1.2 0-.8-.5-1.3-1.4-1.3h-1.8v2.5zm0 5.5h2c1 0 1.6-.6 1.6-1.5S13.5 17 12.5 17h-2v3z" fill="#0f172a" />
      <path d="M17.5 10h2.5l2 8.5 2-8.5H26.5l-3 12h-3l-3-12z" fill="#0f172a" />
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
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Brewnet Dashboard</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
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
