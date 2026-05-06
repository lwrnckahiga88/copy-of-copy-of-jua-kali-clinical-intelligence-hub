import { useState } from "react";
import { Plug, CheckCircle2, RefreshCw, ExternalLink, Wifi } from "lucide-react";

const CONNECTORS = [
  { name: "Epic EHR",      status: "Connected", records: "12,450", icon: "🏥", color: "text-green-400",  border: "border-green-500/30",  bg: "bg-green-900/10" },
  { name: "HL7 Gateway",   status: "Connected", records: "8,920",  icon: "📡", color: "text-cyan-400",   border: "border-cyan-500/30",   bg: "bg-cyan-900/10" },
  { name: "FHIR API",      status: "Connected", records: "5,340",  icon: "🔗", color: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-900/10" },
  { name: "Wearable Sync", status: "Connected", records: "3,210",  icon: "⌚", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-900/10" },
  { name: "M-PESA STK",    status: "Connected", records: "1,890",  icon: "💚", color: "text-emerald-400",border: "border-emerald-500/30",bg: "bg-emerald-900/10" },
  { name: "NHIF/SHIF",     status: "Standby",   records: "650",    icon: "🛡️", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-900/10" },
  { name: "WhatsApp API",  status: "Connected", records: "4,100",  icon: "📱", color: "text-green-400",  border: "border-green-500/30",  bg: "bg-green-900/10" },
  { name: "LangFlow PWA",  status: "Connected", records: "780",    icon: "🔀", color: "text-pink-400",   border: "border-pink-500/30",   bg: "bg-pink-900/10" },
];

const LANGFLOW_SRC = "/agents/langflowbuildersaas.html";

export default function ConnectorUI() {
  const [activeTab, setActiveTab] = useState<"connectors" | "builder">("connectors");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  function handleSync(name: string) {
    setSyncing(name);
    setTimeout(() => setSyncing(null), 1800);
  }

  const totalRecords = CONNECTORS
    .filter(c => c.status === "Connected")
    .reduce((sum, c) => sum + parseInt(c.records.replace(/,/g, ""), 10), 0)
    .toLocaleString();

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-1 flex items-center gap-2">
            <Plug className="w-7 h-7 text-pink-400" />
            Connector UI
          </h1>
          <p className="text-slate-400">Third-party integrations, data connectors &amp; AI pipeline builder</p>
        </div>
        {/* Summary badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-cyan-500/20">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-sm text-slate-300">
            <span className="font-bold text-green-400">{CONNECTORS.filter(c => c.status === "Connected").length}</span>
            <span className="text-slate-500"> / {CONNECTORS.length} active · </span>
            <span className="font-bold text-cyan-400">{totalRecords}</span>
            <span className="text-slate-500"> records</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {(["connectors", "builder"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all capitalize ${
              activeTab === tab
                ? "bg-slate-800 text-cyan-400 border border-b-0 border-slate-700"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab === "connectors" ? "🔌 Active Connectors" : "🔀 LangFlow Builder"}
          </button>
        ))}
      </div>

      {activeTab === "connectors" && (
        <div className="space-y-4">
          {/* Connector grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {CONNECTORS.map((conn, i) => (
              <div
                key={i}
                className={`${conn.bg} border ${conn.border} rounded-xl p-4 flex flex-col gap-3 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{conn.icon}</span>
                    <div>
                      <p className={`font-semibold text-sm ${conn.color}`}>{conn.name}</p>
                      <p className="text-xs text-slate-500">{conn.records} records</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
                    conn.status === "Connected"
                      ? "bg-green-900/30 text-green-400 border-green-500/40"
                      : "bg-yellow-900/30 text-yellow-400 border-yellow-500/40"
                  }`}>
                    {conn.status === "Connected" ? "● LIVE" : "○ STANDBY"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: conn.status === "Connected" ? `${Math.min(100, (parseInt(conn.records.replace(/,/g, ""), 10) / 13000) * 100)}%` : "20%",
                      background: conn.color.replace("text-", "").includes("green") ? "#22c55e"
                        : conn.color.includes("cyan") ? "#06b6d4"
                        : conn.color.includes("blue") ? "#3b82f6"
                        : conn.color.includes("purple") ? "#a855f7"
                        : conn.color.includes("emerald") ? "#10b981"
                        : conn.color.includes("yellow") ? "#eab308"
                        : conn.color.includes("pink") ? "#ec4899"
                        : "#64748b",
                    }}
                  />
                </div>

                <button
                  onClick={() => handleSync(conn.name)}
                  disabled={syncing === conn.name}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-xs font-medium transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing === conn.name ? "animate-spin" : ""}`} />
                  {syncing === conn.name ? "Syncing…" : "Sync Now"}
                </button>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {[
              { label: "Total Records",   value: totalRecords,       color: "text-cyan-400" },
              { label: "Active Streams",  value: "7",                color: "text-green-400" },
              { label: "Last Sync",       value: "2 min ago",        color: "text-slate-300" },
              { label: "Data Freshness",  value: "99.2%",            color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "builder" && (
        <div className="flex flex-col rounded-xl overflow-hidden border border-slate-700/60" style={{ height: "calc(100vh - 200px)" }}>
          {/* iframe toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
            <div>
              <span className="font-semibold text-pink-400 text-sm">LangFlow SaaS Builder</span>
              <span className="text-slate-500 text-xs ml-2 hidden sm:inline">AI workflow pipeline builder</span>
            </div>
            <div className="flex items-center gap-2">
              {!iframeLoaded && !iframeError && (
                <span className="text-xs text-slate-500 animate-pulse">Loading…</span>
              )}
              {iframeLoaded && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              )}
              <a
                href={LANGFLOW_SRC}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-semibold transition-all"
              >
                <ExternalLink className="w-3 h-3" /> Full Screen
              </a>
            </div>
          </div>

          {iframeError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center">
              <span className="text-4xl">⚠️</span>
              <p className="text-slate-400 text-sm">LangFlow builder failed to load</p>
              <a
                href={LANGFLOW_SRC}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold"
              >
                Open LangFlow Builder →
              </a>
            </div>
          ) : (
            <iframe
              src={LANGFLOW_SRC}
              className="flex-1 w-full border-none"
              title="LangFlow SaaS Builder"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
              onLoad={() => setIframeLoaded(true)}
              onError={() => setIframeError(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
