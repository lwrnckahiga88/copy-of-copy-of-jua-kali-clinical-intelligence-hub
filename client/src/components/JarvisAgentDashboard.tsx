/**
 * JarvisAgentDashboard
 * Ported from lwrnckahiga88/juakali-jarvis-agents — Dashboard + AgentCard + AgentViewer
 * Serves /agents/ static HTML files (same-origin, no X-Frame-Options issues)
 */

import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, Play, Zap, ArrowLeft, RefreshCw, ExternalLink, Github } from "lucide-react";

// ─── Types (from jarvis-agents/shared/jarvis-types.ts) ────────────────────────

export type AgentCategory =
  | "medical-ai" | "prediction" | "pandemic" | "clinical"
  | "workflow" | "research" | "learning" | "financial"
  | "services" | "simulation" | "media" | "info";

export interface JarvisAgent {
  agentId: string;
  name: string;
  category: AgentCategory;
  description?: string;
  icon: string;
  creditCost: number;
  htmlFile?: string;
  isExternal: boolean;
  externalUrl?: string;
}

export const AGENT_CATEGORIES: Record<AgentCategory, string> = {
  "medical-ai":  "Medical AI",
  "prediction":  "Prediction & Analysis",
  "pandemic":    "Pandemic Intelligence",
  "clinical":    "Clinical Tools",
  "workflow":    "AI Workflows",
  "research":    "Research & Data",
  "learning":    "Learning & Skills",
  "financial":   "Financial Services",
  "services":    "Medical Services",
  "simulation":  "Simulation",
  "media":       "Media",
  "info":        "Information",
};

// Full agent catalog — synced from juakali-jarvis-agents
export const JARVIS_AGENTS: JarvisAgent[] = [
  // Medical AI
  { agentId:"medical-imaging",   name:"Medical Imaging AI",        category:"medical-ai",  icon:"🖼️",  creditCost:10, htmlFile:"index.html",          isExternal:false },
  { agentId:"nurse-ai",          name:"NurseAI",                   category:"medical-ai",  icon:"👩‍⚕️", creditCost:5,  htmlFile:"NurseAI.html",         isExternal:false },
  { agentId:"chemworkbench",     name:"ChemWorkbench",             category:"medical-ai",  icon:"⚗️",  creditCost:10, htmlFile:"Chemworkbench.html",   isExternal:false },
  // Prediction & Analysis
  { agentId:"quorum-deep",       name:"QuorumDeep",                category:"prediction",  icon:"🎯",  creditCost:15, htmlFile:"QuorumDeep.html",      isExternal:false },
  { agentId:"genomica",          name:"Genomica",                  category:"prediction",  icon:"🧬",  creditCost:20, htmlFile:"Genomica.html",         isExternal:false },
  { agentId:"k-emci",            name:"K-EMCI Emergency",          category:"prediction",  icon:"🚑",  creditCost:10, htmlFile:"K-EMCI.html",           isExternal:false },
  { agentId:"newton-guardian",   name:"Newton Guardian",           category:"prediction",  icon:"🧠",  creditCost:20, htmlFile:"v12.html",              isExternal:false },
  { agentId:"bpu-sim",           name:"BPU-T1 Simulation",         category:"prediction",  icon:"🤖",  creditCost:15, htmlFile:"BpuT1-bioPUsim.html",  isExternal:false },
  // Pandemic Intelligence
  { agentId:"pandemic-intel",    name:"Pandemic Intelligence",     category:"pandemic",    icon:"🌍",  creditCost:15, htmlFile:"pandemic intelligence.html", isExternal:false },
  { agentId:"pandemic-seird",    name:"Pandemic SEIRD",            category:"pandemic",    icon:"📈",  creditCost:10, htmlFile:"pandemicseird1.html",  isExternal:false },
  { agentId:"pandemic-seird2",   name:"Pandemic SEIRD v2",         category:"pandemic",    icon:"📊",  creditCost:10, htmlFile:"pandemicseird2.html",  isExternal:false },
  { agentId:"clinvar-seird",     name:"ClinVar Pandemic SEIRD",    category:"pandemic",    icon:"🔬",  creditCost:15, htmlFile:"clinvarpandemicseird.html", isExternal:false },
  { agentId:"unified-pandemic",  name:"Unified Pandemic LangFlow", category:"pandemic",    icon:"🌐",  creditCost:20, htmlFile:"unifiedpandemiclangflow.html", isExternal:false },
  // Clinical Tools
  { agentId:"clin-validation",   name:"Clinical Validation AI",    category:"clinical",    icon:"✅",  creditCost:10, htmlFile:"clinValidAi.html",     isExternal:false },
  { agentId:"clin-val-pro2",     name:"Clinical Validation Pro 2", category:"clinical",    icon:"🔬",  creditCost:20, htmlFile:"clinicalvalidationworkflowbuilderpro2.html", isExternal:false },
  { agentId:"clinvar-pandemic3", name:"ClinVar Pandemic v3",       category:"clinical",    icon:"🧬",  creditCost:15, htmlFile:"clin-varpandemic3.html", isExternal:false },
  // AI Workflows
  { agentId:"langflow-saas",     name:"LangFlow SaaS Builder",     category:"workflow",    icon:"🔀",  creditCost:10, htmlFile:"langflowbuildersaas.html", isExternal:false },
  { agentId:"langflow-v2",       name:"LangFlow Builder v2",       category:"workflow",    icon:"⚙️",  creditCost:10, htmlFile:"langflowbuilderv2.html", isExternal:false },
  { agentId:"langflow-dao",      name:"LangFlow DAO PWA",          category:"workflow",    icon:"📱",  creditCost:10, htmlFile:"langflowdaopwa.html",  isExternal:false },
  { agentId:"ai-microservice",   name:"AI LangFlow Microservice",  category:"workflow",    icon:"🤖",  creditCost:15, htmlFile:"Ailangflowmicroservice.html", isExternal:false },
  { agentId:"unified-ai-lang",   name:"Unified AI Microservice",   category:"workflow",    icon:"🌐",  creditCost:15, htmlFile:"unifiedAImicroservicelang.html", isExternal:false },
  // Learning
  { agentId:"techskills",        name:"TechSkills",                category:"learning",    icon:"📚",  creditCost:0,  htmlFile:"techskills.html",      isExternal:false },
  // Services
  { agentId:"secondary-care",    name:"Secondary Care",            category:"services",    icon:"🏥",  creditCost:0,  htmlFile:"secondary.html",       isExternal:false },
  { agentId:"tertiary-care",     name:"Tertiary Care (MedOS)",     category:"services",    icon:"🏨",  creditCost:0,  htmlFile:"tertiary.html",        isExternal:false },
  // Simulation
  { agentId:"netstream",         name:"NetStream Full Suite",      category:"simulation",  icon:"📡",  creditCost:5,  htmlFile:"netstreamfullstream.html", isExternal:false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function agentUrl(agent: JarvisAgent): string {
  if (agent.htmlFile) {
    // Encode spaces but not other URL chars
    return `/agents/${agent.htmlFile.replace(/ /g, "%20")}`;
  }
  return "";
}

// ─── CreditBar (from jarvis-agents) ──────────────────────────────────────────

function CreditBar({ credits }: { credits: number }) {
  const color = credits > 50 ? "text-emerald-400" : credits > 20 ? "text-amber-400" : "text-red-400";
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-cyan-500/20">
      <Zap className={`w-4 h-4 ${color}`} />
      <span className={`font-mono text-sm font-semibold ${color}`}>{credits}</span>
      <span className="text-xs text-slate-400 hidden sm:inline">credits</span>
    </div>
  );
}

// ─── AgentCard (from jarvis-agents/AgentCard.tsx) ────────────────────────────

function AgentCard({
  agent,
  credits,
  onLaunch,
}: {
  agent: JarvisAgent;
  credits: number;
  onLaunch: (agent: JarvisAgent) => void;
}) {
  const [launching, setLaunching] = useState(false);
  const canLaunch = credits >= agent.creditCost && !!agentUrl(agent);
  const insufficient = credits < agent.creditCost;

  function handleLaunch() {
    if (!canLaunch) return;
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      onLaunch(agent);
    }, 300);
  }

  return (
    <div className="flex flex-col bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 hover:border-cyan-500/40 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{agent.icon}</span>
        {agent.creditCost > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 rounded text-xs font-mono text-cyan-300">
            <Zap className="w-3 h-3" />
            {agent.creditCost}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{agent.name}</h3>
      <p className="text-xs text-slate-400 mb-4 line-clamp-2 flex-1">{agent.description}</p>

      <button
        onClick={handleLaunch}
        disabled={!canLaunch || launching}
        className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
          insufficient
            ? "bg-slate-700/40 text-slate-500 cursor-not-allowed"
            : launching
            ? "bg-cyan-600/50 text-cyan-200 cursor-wait"
            : canLaunch
            ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30"
            : "bg-slate-700/40 text-slate-500 cursor-not-allowed"
        }`}
      >
        {launching ? (
          <><Loader2 className="w-4 h-4 animate-spin" /><span>Launching…</span></>
        ) : (
          <><Play className="w-4 h-4" /><span>Launch</span></>
        )}
      </button>
      {insufficient && (
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Need {agent.creditCost - credits} more credits
        </p>
      )}
    </div>
  );
}

// ─── AgentViewer (from jarvis-agents/AgentViewer.tsx) ────────────────────────

function AgentViewer({
  agent,
  onBack,
}: {
  agent: JarvisAgent;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);
  const src = agentUrl(agent);

  return (
    <div className="flex flex-col" style={{ minHeight: "100%" }}>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-cyan-500/20 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm truncate">
              {agent.icon} {agent.name}
            </div>
            <div className="text-xs text-slate-400 truncate hidden sm:block">
              {agent.description}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {error && (
            <button
              onClick={() => { setError(false); setLoading(true); setKey(k => k + 1); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          )}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all"
          >
            <ExternalLink className="w-3 h-3" /> Full Screen
          </a>
        </div>
      </header>

      {/* Iframe */}
      <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 4rem)" }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-slate-400 text-sm">Loading {agent.name}…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 gap-4 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-slate-300 font-medium">Failed to load module</p>
            <p className="text-slate-500 text-sm max-w-sm">{agent.description}</p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all"
            >
              Open {agent.name} →
            </a>
          </div>
        )}
        <iframe
          key={key}
          src={src}
          className="w-full h-full border-none"
          style={{ minHeight: "calc(100vh - 4rem)" }}
          title={agent.name}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

interface JarvisAgentDashboardProps {
  /** Pre-select a category tab */
  defaultCategory?: AgentCategory;
  /** Page title shown in the header */
  title: string;
  /** Subtitle / description */
  subtitle: string;
  /** Icon for this module */
  icon: string;
}

export default function JarvisAgentDashboard({
  defaultCategory = "medical-ai",
  title,
  subtitle,
  icon,
}: JarvisAgentDashboardProps) {
  const [category, setCategory] = useState<AgentCategory>(defaultCategory);
  const [credits, setCredits] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("juakali_credits") ?? "100", 10); }
    catch { return 100; }
  });
  const [activeAgent, setActiveAgent] = useState<JarvisAgent | null>(null);

  function handleCredits(n: number) {
    setCredits(n);
    try { localStorage.setItem("juakali_credits", String(n)); } catch {}
  }

  function handleLaunch(agent: JarvisAgent) {
    handleCredits(Math.max(0, credits - agent.creditCost));
    setActiveAgent(agent);
  }

  const filtered = useMemo(
    () => JARVIS_AGENTS.filter(a => a.category === category),
    [category]
  );

  const categories = Object.entries(AGENT_CATEGORIES) as [AgentCategory, string][];

  // If an agent is open, show the viewer full-screen
  if (activeAgent) {
    return <AgentViewer agent={activeAgent} onBack={() => setActiveAgent(null)} />;
  }

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 flex-shrink-0 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{icon}</span>
            <div className="min-w-0">
              <span className="font-bold text-white text-sm">{title}</span>
              <span className="text-slate-400 text-xs ml-2 hidden sm:inline">{subtitle}</span>
            </div>
          </div>
          <CreditBar credits={credits} />
        </div>
      </header>

      {/* Category tabs */}
      <div className="flex-shrink-0 border-b border-cyan-500/10 bg-slate-900/30 sticky top-14 z-30">
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide">
          {categories.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === key
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent grid */}
      <main className="flex-1 p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-8 h-8 text-slate-500" />
            <p className="text-slate-400 text-sm">No agents in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(agent => (
              <AgentCard
                key={agent.agentId}
                agent={agent}
                credits={credits}
                onLaunch={handleLaunch}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-cyan-500/10 px-4 py-3 text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Github className="w-3 h-3" />
          juA.kali Jarvis Agent Platform · synced from lwrnckahiga88/juakali-jarvis-agents
        </p>
      </footer>
    </div>
  );
}
