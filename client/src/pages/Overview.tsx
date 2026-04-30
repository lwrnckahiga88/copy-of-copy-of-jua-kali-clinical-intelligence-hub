import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";

const PROXY = "/proxy/agent";

const QUICK_AGENTS = [
  { id:"nurse-ai",       label:"🩺 NurseAI",        file:"NurseAI.html",             desc:"Patient vitals & triage" },
  { id:"k-emci",         label:"🚑 K-EMCI",          file:"K-EMCI.html",              desc:"Emergency care + M-PESA" },
  { id:"genomica",       label:"🧬 Genomica",         file:"Genomica.html",            desc:"Genomic analysis" },
  { id:"chemworkbench",  label:"⚗️ ChemWorkbench",   file:"Chemworkbench.html",       desc:"Clinical chemistry" },
  { id:"pandemic-seird", label:"🦠 SEIRD Model",      file:"pandemicseird1.html",      desc:"Epidemic intelligence" },
  { id:"langflow",       label:"🔀 LangFlow",         file:"langflowbuildersaas.html", desc:"AI pipeline builder" },
  { id:"quorum-deep",    label:"🧠 QuorumDeep",       file:"QuorumDeep.html",          desc:"Clinical AI reasoning" },
  { id:"techskills",     label:"📚 TechSkills",       file:"techskills.html",          desc:"Medical education" },
];

const STATS = [
  { label:"Agents",    value:"49" },
  { label:"Hospitals", value:"3" },
  { label:"AI Models", value:"12+" },
  { label:"M-PESA",   value:"✓" },
];

export default function Overview() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeFile, setActiveFile] = useState<string | null>(null);

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* Stats bar */}
      <div className="grid grid-cols-4 border-b border-slate-800 flex-shrink-0">
        {STATS.map(s => (
          <div key={s.label} className="py-3 px-4 text-center border-r border-slate-800 last:border-r-0">
            <div className="text-cyan-400 font-bold text-lg leading-tight">{s.value}</div>
            <div className="text-slate-500 text-xs uppercase tracking-wide mt-0.5 hidden sm:block">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Body — sidebar + main on md+, stacked on mobile */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* Agent sidebar */}
        <aside className="w-full md:w-56 lg:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950 overflow-y-auto">
          <div className="p-3">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 px-1">Quick Launch</p>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5">
              {QUICK_AGENTS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setActiveFile(a.file)}
                  className={`text-left rounded-lg p-2.5 border transition-all ${
                    activeFile === a.file
                      ? "bg-slate-900 border-cyan-500/60 text-white"
                      : "bg-transparent border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  <div className="font-medium text-sm">{a.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5 hidden md:block">{a.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setLocation("/health-ai-agents")}
              className="mt-3 w-full py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-sm font-semibold transition-all"
            >
              All 49 Agents →
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {activeFile ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Iframe toolbar */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
                <span className="text-sm text-slate-300 font-medium truncate">{activeFile}</span>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <a
                    href={`${PROXY}?file=${activeFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-semibold transition-all"
                  >
                    ↗ Open
                  </a>
                  <button
                    onClick={() => setActiveFile(null)}
                    className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <iframe
                key={activeFile}
                src={`${PROXY}?file=${activeFile}`}
                className="flex-1 w-full border-none"
                title={activeFile}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Hero */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 md:p-7 mb-5">
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">
                  National Clinical AI Infrastructure
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-5 max-w-2xl">
                  49 clinical AI agents spanning oncology, pandemic intelligence, genomics, emergency care,
                  and clinical workflows — built for Kenya and East Africa. Offline-first, M-PESA integrated.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFile("K-EMCI.html")}
                    className="px-4 py-2 rounded-lg bg-green-700/80 hover:bg-green-600 text-white text-sm font-semibold transition-all"
                  >
                    🚑 Emergency Care
                  </button>
                  <button
                    onClick={() => setActiveFile("NurseAI.html")}
                    className="px-4 py-2 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-white text-sm font-semibold transition-all"
                  >
                    🩺 NurseAI
                  </button>
                  <button
                    onClick={() => setLocation("/jarvis")}
                    className="px-4 py-2 rounded-lg bg-blue-700/80 hover:bg-blue-600 text-white text-sm font-semibold transition-all"
                  >
                    ⚡ Jarvis
                  </button>
                  <button
                    onClick={() => setLocation("/health-ai-agents")}
                    className="px-4 py-2 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-white text-sm font-semibold transition-all"
                  >
                    🔬 All Agents
                  </button>
                </div>
              </div>

              {/* Agent grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {QUICK_AGENTS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setActiveFile(a.file)}
                    className="text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-4 transition-all group"
                  >
                    <div className="text-2xl mb-2">{a.label.split(" ")[0]}</div>
                    <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {a.label.slice(a.label.indexOf(" ") + 1)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{a.desc}</div>
                    <div className="text-xs text-cyan-500 font-bold uppercase tracking-wide mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Launch →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
