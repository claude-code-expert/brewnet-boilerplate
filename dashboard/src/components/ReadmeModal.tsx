"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ReadmeModalProps {
  stackName: string;
  onClose: () => void;
}

export default function ReadmeModal({ stackName, onClose }: ReadmeModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/stacks/${stackName}/readme`)
      .then((r) => r.json())
      .then((data) => {
        if (data.content) setContent(data.content);
        else setError(data.message ?? "Failed to load README");
      })
      .catch(() => setError("Failed to load README"));
  }, [stackName]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          width: "min(860px, 100%)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{stackName} / README.md</span>
          <button
            onClick={onClose}
            style={{ background: "transparent", color: "var(--muted)", fontSize: 18, padding: "0 4px" }}
          >
            ✕
          </button>
        </div>
        <div style={{ overflow: "auto", padding: "16px 24px", flex: 1 }}>
          {error && <p style={{ color: "var(--error)" }}>{error}</p>}
          {!error && !content && <p style={{ color: "var(--muted)" }}>Loading...</p>}
          {content && (
            <div className="markdown">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
