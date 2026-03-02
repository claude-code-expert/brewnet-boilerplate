"use client";

import { useState } from "react";
import type { StackInfo } from "@/lib/types";
import { GITHUB_REPO_URL } from "@/lib/stacks";
import ApiExplorer from "./ApiExplorer";
import ReadmeModal from "./ReadmeModal";

const STATUS_COLORS = {
  stopped: "var(--muted)",
  starting: "var(--warning)",
  running: "var(--success)",
  stopping: "var(--warning)",
  error: "var(--error)",
};

const STATUS_LABELS = {
  stopped: "Stopped",
  starting: "Starting…",
  running: "Running",
  stopping: "Stopping…",
  error: "Error",
};

interface StackCardProps {
  stack: StackInfo;
  onStart: (name: string) => Promise<void>;
  onStop: (name: string) => Promise<void>;
}

export default function StackCard({ stack, onStart, onStop }: StackCardProps) {
  const [busy, setBusy] = useState(false);
  const [showReadme, setShowReadme] = useState(false);

  async function handleStart() {
    setBusy(true);
    try { await onStart(stack.name); } finally { setBusy(false); }
  }

  async function handleStop() {
    setBusy(true);
    try { await onStop(stack.name); } finally { setBusy(false); }
  }

  const isRunning = stack.status === "running";
  const isStopped = stack.status === "stopped" || stack.status === "error";
  const color = STATUS_COLORS[stack.status];

  return (
    <>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{stack.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {stack.language} {stack.version} · {stack.framework}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{stack.orm}</div>
          </div>
          {/* Status badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "var(--surface2)",
            border: `1px solid ${color}40`,
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 600,
            color,
          }}>
            {isRunning && <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", animation: "pulse 2s infinite" }} />}
            {STATUS_LABELS[stack.status]}
          </div>
        </div>

        {/* Ports */}
        {stack.ports && (
          <div style={{ display: "flex", gap: 6 }}>
            {!stack.isUnified && (
              <span style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 11,
                fontFamily: "var(--mono)",
                color: "var(--muted)",
              }}>
                :{stack.ports.backendPort}
              </span>
            )}
            <span style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 11,
              fontFamily: "var(--mono)",
              color: "var(--muted)",
            }}>
              :{stack.ports.frontendPort}
            </span>
          </div>
        )}

        {/* Error message */}
        {stack.errorMessage && (
          <div style={{ fontSize: 11, color: "var(--error)", background: "#2d0f0f", border: "1px solid #5a1a1a", borderRadius: 4, padding: "4px 8px" }}>
            {stack.errorMessage}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {isStopped && (
            <button
              onClick={handleStart}
              disabled={busy}
              style={{ background: "var(--primary)", color: "#0f172a", fontWeight: 700 }}
            >
              {busy ? "Starting…" : "▶ Start"}
            </button>
          )}
          {!isStopped && (
            <button
              onClick={handleStop}
              disabled={busy || stack.status === "stopping"}
              style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
            >
              {busy ? "Stopping…" : "■ Stop"}
            </button>
          )}
          <button
            onClick={() => setShowReadme(true)}
            style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            README
          </button>
          <a
            href={`${GITHUB_REPO_URL}/tree/${stack.githubBranch}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              padding: "6px 14px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            GitHub ↗
          </a>
        </div>

        {/* API Explorer (when running) */}
        {isRunning && <ApiExplorer stack={stack} />}
      </div>

      {showReadme && (
        <ReadmeModal stackName={stack.name} onClose={() => setShowReadme(false)} />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
