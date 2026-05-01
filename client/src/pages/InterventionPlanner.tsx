/**
 * Intervention Planner — renders K-EMCI.html
 * HealthNav Emergency PWA
 */
import { useState } from "react";

const SRC = "/agents/K-EMCI.html";

export default function InterventionPlanner() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col" style={{ minHeight: "100%", background: "#0f172a" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="min-w-0">
          <span className="font-semibold text-cyan-400 text-sm">Intervention Planner</span>
          <span className="text-slate-500 text-xs ml-2 hidden sm:inline">HealthNav Emergency PWA</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {!loaded && !error && (
            <span className="text-xs text-slate-500 animate-pulse">Loading…</span>
          )}
          <a
            href={SRC}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-semibold transition-all whitespace-nowrap"
          >
            ↗ Full Screen
          </a>
        </div>
      </div>

      {/* Agent iframe */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-950 p-8">
          <span className="text-4xl">⚠️</span>
          <p className="text-slate-400 text-sm text-center">Emergency care coordination with M-PESA payment integration</p>
          <a
            href={SRC}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all"
          >
            Open Intervention Planner →
          </a>
        </div>
      ) : (
        <iframe
          src={SRC}
          className="flex-1 w-full border-none"
          style={{ minHeight: "calc(100vh - 80px)" }}
          title="Intervention Planner"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
