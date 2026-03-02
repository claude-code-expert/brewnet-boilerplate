"use client";

import type { Language } from "@/lib/types";

const LANGUAGES: Language[] = ["Go", "Rust", "Java", "Kotlin", "Node.js", "Python"];

const LANG_COLORS: Record<Language, string> = {
  Go: "#00add8",
  Rust: "#ce422b",
  Java: "#f89820",
  Kotlin: "#7f52ff",
  "Node.js": "#68a063",
  Python: "#3776ab",
};

interface FilterBarProps {
  selected: Language | null;
  onChange: (lang: Language | null) => void;
  counts: Record<string, number>;
}

export default function FilterBar({ selected, onChange, counts }: FilterBarProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 0 16px" }}>
      <button
        onClick={() => onChange(null)}
        style={{
          background: selected === null ? "var(--primary)" : "var(--surface)",
          color: selected === null ? "#0f172a" : "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "5px 14px",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        All ({Object.values(counts).reduce((a, b) => a + b, 0)})
      </button>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang === selected ? null : lang)}
          style={{
            background: selected === lang ? LANG_COLORS[lang] : "var(--surface)",
            color: selected === lang ? "#fff" : "var(--text)",
            border: `1px solid ${selected === lang ? LANG_COLORS[lang] : "var(--border)"}`,
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {lang} ({counts[lang] ?? 0})
        </button>
      ))}
    </div>
  );
}
