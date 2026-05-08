/**
 * Triad Neuro
 * Source: jua-kali-platform/TriadNeuro.tsx
 * Extended: OncoAI PWA v3 modules (Imaging, Pipeline, Treatment, About) added as tabs
 */
import { useState } from "react";
import { Brain, Zap, Eye, Activity, ExternalLink } from "lucide-react";

type Tab = "eeg" | "seizure" | "medication" | "imaging" | "pipeline" | "treatment" | "about";

const ONCOAI_SRC = "/agents/oncoai-pwa-v3.html";

const EEG_REGIONS = [
  { region: "Frontal Lobe",   activity: "Normal",   confidence: 95 },
  { region: "Temporal Lobe",  activity: "Abnormal", confidence: 88 },
  { region: "Parietal Lobe",  activity: "Normal",   confidence: 92 },
  { region: "Occipital Lobe", activity: "Normal",   confidence: 96 },
];

const AED_DRUGS = [
  { drug: "Levetiracetam", level: 7.2, min: 4,  max: 10,  unit: "μg/mL" },
  { drug: "Lamotrigine",   level: 5.8, min: 2,  max: 8,   unit: "μg/mL" },
  { drug: "Valproic Acid", level: 68,  min: 50, max: 100, unit: "μg/mL" },
];

// OncoAI pipeline simulation state
const PIPELINE_STAGES = [
  { icon: "📤", label: "Upload" },    { icon: "⚙️", label: "Preprocess" },
  { icon: "🎯", label: "Segment" },   { icon: "🤖", label: "Gemini" },
  { icon: "🏥", label: "Clinical" },  { icon: "💊", label: "Treatment" },
  { icon: "📊", label: "Decision" },  { icon: "📄", label: "Report" },
];

const TABS: { id: Tab; label: string; icon: string; group: "neuro" | "onco" }[] = [
  { id: "eeg",       label: "EEG Analysis",      icon: "🧠", group: "neuro" },
  { id: "seizure",   label: "Seizure Risk",       icon: "⚡", group: "neuro" },
  { id: "medication",label: "Drug Levels",        icon: "💊", group: "neuro" },
  { id: "imaging",   label: "MRI Imaging",        icon: "🖼️", group: "onco" },
  { id: "pipeline",  label: "AI Pipeline",        icon: "🔬", group: "onco" },
  { id: "treatment", label: "Treatment DQN",      icon: "📈", group: "onco" },
  { id: "about",     label: "OncoAI About",       icon: "ℹ️", group: "onco" },
];

export default function TriadNeuro() {
  const [tab, setTab] = useState<Tab>("eeg");
  const [iframeSection, setIframeSection] = useState<Tab | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Use an iframe for OncoAI tabs so we get the full interactive app
  const oncoTabs: Tab[] = ["imaging", "pipeline", "treatment", "about"];
  const isOnco = oncoTabs.includes(tab);

  // Map our tab to OncoAI's internal page name
  const oncoPageMap: Record<string, string> = {
    imaging: "imaging", pipeline: "pipeline", treatment: "treatment", about: "about"
  };

  return (
    <div className="space-y-4 p-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400 font-mono mb-1">Triad Neuro</h1>
        <p className="text-slate-400 text-sm">
          Neurological analysis · seizure prediction · OncoAI PWA v3 (Imaging, Pipeline, Treatment)
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"EEG ABNORMALITY",  value:"3",   sub:"Active focal abnormalities", color:"text-purple-400", border:"border-purple-500/30", Icon:Brain },
          { label:"SEIZURE RISK",     value:"82%", sub:"High confidence prediction",  color:"text-red-400",    border:"border-red-500/30",    Icon:Zap },
          { label:"NEURO EVENTS",     value:"12",  sub:"Last 24 hours",               color:"text-cyan-400",   border:"border-cyan-500/30",   Icon:Activity },
          { label:"MEDICATION LEVEL", value:"7.2", sub:"Therapeutic range",           color:"text-green-400",  border:"border-green-500/30",  Icon:Eye },
        ].map(({ label, value, sub, color, border, Icon }) => (
          <div key={label} className={`bg-slate-800/50 border ${border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color} mb-0.5`}>{value}</div>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tab bar — two groups */}
      <div className="border-b border-slate-800">
        <div className="flex gap-1 flex-wrap pb-0">
          <span className="text-xs text-slate-600 font-mono uppercase tracking-widest self-center px-1 hidden sm:inline">Neuro ·</span>
          {TABS.filter(t => t.group === "neuro").map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all ${
                tab === t.id ? "bg-slate-800 text-purple-400 border border-b-0 border-slate-700"
                             : "text-slate-500 hover:text-slate-300"}`}>
              {t.icon} {t.label}
            </button>
          ))}
          <span className="text-xs text-slate-600 font-mono uppercase tracking-widest self-center px-2 hidden sm:inline">OncoAI ·</span>
          {TABS.filter(t => t.group === "onco").map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setIframeReady(false); }}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all ${
                tab === t.id ? "bg-blue-900/40 text-blue-300 border border-b-0 border-blue-800/60"
                             : "text-slate-500 hover:text-blue-300"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── NEURO: EEG ── */}
      {tab === "eeg" && (
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-bold text-purple-400 font-mono">EEG Analysis</h2>
          {EEG_REGIONS.map(item => (
            <div key={item.region} className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-200 font-semibold text-sm">{item.region}</h3>
                <span className={`text-sm font-mono ${item.activity === "Normal" ? "text-green-400" : "text-orange-400"}`}>
                  {item.activity}
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className={`h-2 rounded-full ${item.activity === "Normal" ? "bg-green-500" : "bg-orange-500"}`}
                  style={{ width: `${item.confidence}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.confidence}% confidence</p>
            </div>
          ))}
        </div>
      )}

      {/* ── NEURO: SEIZURE ── */}
      {tab === "seizure" && (
        <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-red-400 font-mono">Seizure Prediction Model — 82% Risk</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-3 text-sm">Risk Factors</h3>
              <ul className="space-y-2 text-sm">
                {["Recent medication change","Sleep deprivation detected","Elevated stress markers","Fever (38.2°C)"].map(r => (
                  <li key={r} className="flex items-center gap-2">
                    <span className="text-red-400">•</span><span className="text-slate-300">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-3 text-sm">Protective Factors</h3>
              <ul className="space-y-2 text-sm">
                {["Medication compliant","Regular sleep pattern","Stable vital signs","No recent triggers"].map(p => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span><span className="text-slate-300">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300">
              <strong>Recommendation:</strong> Increase monitoring to every 2 hours. Consider prophylactic medication
              adjustment. Patient education on seizure triggers recommended.
            </p>
          </div>
        </div>
      )}

      {/* ── NEURO: MEDICATION ── */}
      {tab === "medication" && (
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-bold text-cyan-400 font-mono">Antiepileptic Drug Levels</h2>
          {AED_DRUGS.map(item => {
            const pct = Math.min(100, Math.max(0, ((item.level - item.min) / (item.max - item.min)) * 100));
            return (
              <div key={item.drug} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-200 font-semibold text-sm">{item.drug}</h3>
                  <span className="text-cyan-400 font-mono text-sm">{item.level} {item.unit}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3">
                  <div className="h-3 bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">Therapeutic: {item.min}–{item.max} {item.unit}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ONCO TABS: iframe loading OncoAI PWA v3 ── */}
      {isOnco && (
        <div className="rounded-xl overflow-hidden border border-blue-500/30 flex flex-col"
          style={{ height: "calc(100vh - 240px)", minHeight: "480px" }}>

          {/* Toolbar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="min-w-0">
              <span className="font-semibold text-blue-300 text-sm">🧠 OncoAI PWA v3</span>
              <span className="text-slate-500 text-xs ml-2 hidden sm:inline">
                {tab === "imaging"   && "BRATS-AFRICA · UNet++ Segmentation"}
                {tab === "pipeline"  && "8-Stage Agentic Pipeline · Gemini Vision"}
                {tab === "treatment" && "DQN Reinforcement Learning · IQVIA Quintiles"}
                {tab === "about"     && "Africa-Ready · FHIR R4 · Offline PWA"}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {!iframeReady && <span className="text-xs text-slate-500 animate-pulse">Loading…</span>}
              <a href={ONCOAI_SRC} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-semibold">
                <ExternalLink className="w-3 h-3" /> Full Screen
              </a>
            </div>
          </div>

          {/* iframe — loads OncoAI then auto-navigates to the right page */}
          <iframe
            key={tab}
            src={ONCOAI_SRC}
            className="flex-1 w-full border-none"
            title={`OncoAI PWA v3 — ${tab}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-presentation"
            onLoad={(e) => {
              setIframeReady(true);
              // Navigate the iframe to the correct internal page
              try {
                const win = (e.target as HTMLIFrameElement).contentWindow as any;
                if (win && win.navigateTo) {
                  win.navigateTo(oncoPageMap[tab] || tab);
                }
              } catch (_) { /* cross-origin guard */ }
            }}
          />
        </div>
      )}
    </div>
  );
}
