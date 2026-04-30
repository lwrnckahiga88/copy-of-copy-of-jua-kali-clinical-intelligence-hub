import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";

const RAW = "https://raw.githubusercontent.com/lwrnckahiga88/health-ai/main/public";

const CAT_META: Record<string, { label: string; icon: string; color: string }> = {
  "medical-ai":  { label: "Medical AI",       icon: "🧠", color: "#06b6d4" },
  "pandemic":    { label: "Pandemic Intel",    icon: "🦠", color: "#f59e0b" },
  "clinical":    { label: "Clinical Tools",    icon: "🔬", color: "#8b5cf6" },
  "workflow":    { label: "Workflows",         icon: "🔀", color: "#3b82f6" },
  "prediction":  { label: "Prediction",        icon: "📊", color: "#06b6d4" },
  "simulation":  { label: "Simulation",        icon: "⚡", color: "#22c55e" },
  "financial":   { label: "Health Finance",    icon: "💰", color: "#f59e0b" },
  "services":    { label: "Services",          icon: "🏥", color: "#06b6d4" },
  "media":       { label: "Media",             icon: "🎥", color: "#64748b" },
  "info":        { label: "Information",       icon: "ℹ️",  color: "#64748b" },
};

export default function HealthAIAgents() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [viewer, setViewer] = useState<{ name: string; url: string } | null>(null);
  const [showCatMenu, setShowCatMenu] = useState(false);

  const { data, isLoading } = trpc.healthAiAgents.fetchAll.useQuery();
  const agents: any[] = data?.agents ?? [];

  const categories = useMemo(() => ["all", ...Array.from(new Set(agents.map((a: any) => a.category)))], [agents]);

  const filtered = useMemo(() => agents.filter((a: any) => {
    const matchCat = activeCat === "all" || a.category === activeCat;
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  }), [agents, activeCat, search]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* Topbar */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-3 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex-shrink-0">
          <span className="font-bold text-cyan-400 text-sm">Health AI Agents</span>
          <span className="text-slate-500 text-xs ml-2">{agents.length} modules</span>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search agents…"
          className="flex-1 min-w-[140px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />

        {/* Category picker — dropdown on mobile, pills on md+ */}
        <div className="hidden md:flex flex-wrap gap-1">
          {categories.map(cat => {
            const m = CAT_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                  activeCat === cat
                    ? "bg-cyan-600/20 border-cyan-500/60 text-cyan-300"
                    : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                {cat === "all" ? "🗂 All" : `${m?.icon ?? "📌"} ${m?.label ?? cat}`}
              </button>
            );
          })}
        </div>

        {/* Mobile category select */}
        <select
          className="md:hidden bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-300"
          value={activeCat}
          onChange={e => setActiveCat(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All categories" : (CAT_META[cat]?.label ?? cat)}
            </option>
          ))}
        </select>

        {viewer && (
          <button onClick={() => setViewer(null)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold flex-shrink-0">
            ✕ Close
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Agent grid — full width when no viewer, 320px when viewer open (hidden on mobile when viewer open) */}
        <div className={`overflow-y-auto p-3 transition-all ${viewer ? "hidden sm:block sm:w-72 lg:w-80 flex-shrink-0 border-r border-slate-800" : "w-full"}`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="text-3xl mb-3">⚡</div>
              <div className="text-sm">Loading agents…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="text-3xl mb-3">🔍</div>
              <div className="text-sm">No agents match your search</div>
            </div>
          ) : (
            <div className={`grid gap-2.5 ${viewer ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
              {filtered.map((agent: any) => {
                const m = CAT_META[agent.category] ?? { color: "#64748b", icon: "📌", label: agent.category };
                const hasHtml = agent.htmlUrl || agent.htmlFile;
                const isActive = viewer?.name === agent.name;
                return (
                  <button
                    key={agent.id}
                    onClick={() => hasHtml && setViewer({
                      name: agent.name,
                      url: agent.htmlUrl ?? `${RAW}/${agent.htmlFile}`,
                    })}
                    disabled={!hasHtml}
                    className={`text-left rounded-xl p-3 border transition-all ${
                      isActive
                        ? "bg-slate-800 border-cyan-500/60"
                        : hasHtml
                        ? "bg-slate-900 border-slate-800 hover:border-slate-600 cursor-pointer"
                        : "bg-slate-900/50 border-slate-800/50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="text-xl">{agent.icon ?? m.icon}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                        style={{ background: `${m.color}20`, color: m.color }}>
                        {m.label}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-200 leading-tight">{agent.name}</div>
                    {!viewer && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{agent.description}</div>
                    )}
                    {hasHtml && (
                      <div className="text-xs font-bold uppercase tracking-wide mt-2" style={{ color: m.color }}>
                        {isActive ? "● Active" : "Launch →"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Iframe viewer */}
        {viewer && (
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
              <span className="text-sm font-medium text-slate-300 truncate">{viewer.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {/* Back button for mobile */}
                <button onClick={() => setViewer(null)} className="sm:hidden text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                  ← Back
                </button>
                <a href={viewer.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-semibold">
                  ↗ New Tab
                </a>
                <button onClick={() => setViewer(null)}
                  className="hidden sm:block text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold">
                  ✕
                </button>
              </div>
            </div>
            <iframe
              key={viewer.url}
              src={viewer.url}
              className="flex-1 w-full border-none"
              title={viewer.name}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            />
          </div>
        )}
      </div>
    </div>
  );
}
