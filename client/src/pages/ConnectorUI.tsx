/**
 * Connector U I — renders langflowbuildersaas.html from health-ai repo
 * Auth-free: accessible without OAuth
 */
import { useState } from "react";

const SRC = "https://raw.githubusercontent.com/lwrnckahiga88/health-ai/main/public/langflowbuildersaas.html";

export default function ConnectorUI() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col" style={{minHeight:"100%", background:"#0f172a"}}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div>
          <span className="font-semibold text-cyan-400 text-sm">Connector U I</span>
          <span className="text-slate-500 text-xs ml-2">health-ai · langflowbuildersaas.html</span>
        </div>
        <div className="flex items-center gap-2">
          {!loaded && !error && (
            <span className="text-xs text-slate-500 animate-pulse">Loading…</span>
          )}
          <a
            href={SRC}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-semibold transition-all"
          >
            ↗ Open
          </a>
        </div>
      </div>

      {/* Agent iframe */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-950">
          <span className="text-3xl">⚠️</span>
          <p className="text-slate-400 text-sm">Failed to load agent</p>
          <a href={SRC} target="_blank" rel="noopener noreferrer"
            className="text-xs px-4 py-2 rounded bg-blue-600/80 text-white font-semibold">
            Open in new tab →
          </a>
        </div>
      ) : (
        <iframe
          src={SRC}
          className="flex-1 w-full border-none"
          style={{minHeight:"calc(100vh - 80px)"}}
          title="Connector U I"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
