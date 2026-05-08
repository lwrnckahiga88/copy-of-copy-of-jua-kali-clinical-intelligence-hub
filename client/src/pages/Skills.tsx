/**
 * Skills & Courses — triple merge
 * 1. jua-kali-platform/Skills.tsx — clinical skills, implementation priority, model health
 * 2. TechSkills HTML (techskills.html) — full micro-campus content extracted inline
 * 3. OncoAI PWA v3 — 4 course modules as interactive iframe cards
 */
import { useState } from "react";
import { Lightbulb, TrendingUp, ExternalLink, BookOpen, Brain, MapPin, MessageSquare, BarChart3 } from "lucide-react";

// ─────────────────────────────────────────────
// jua-kali-platform Skills data
// ─────────────────────────────────────────────
const SKILL_AREAS = [
  { area:"Clinician Feedback Loop", icon:"🩺", recommendations:[
    "Capture 5-star ratings with structured signals for accuracy, usefulness, relevance, and actionability.",
    "Feed validated comments into a retraining queue with confidence-aware weighting.",
    "Expose feedback history so clinicians can see how model behaviour improves over time.",
  ]},
  { area:"Predictive Intelligence", icon:"🔬", recommendations:[
    "Prioritise seizure risk, adverse event, and hospitalisation probability outputs with confidence intervals.",
    "Surface recommendation windows that explain why each prediction matters clinically.",
    "Align predictive summaries with protocol validation before operational rollout.",
  ]},
  { area:"Security & Authorization", icon:"🔒", recommendations:[
    "Expand protected routing for patient-sensitive views using the existing authentication layer.",
    "Differentiate clinician and admin visibility instead of creating a second UI system.",
    "Maintain auditable access patterns for FHIR, wearable, and imaging workflows.",
  ]},
  { area:"Operational Readiness", icon:"🤖", recommendations:[
    "Prepare GitHub Actions, deployment automation, and environment setup as the next implementation wave.",
    "Add tests around alert rules, connector procedures, and wearable data synchronisation.",
    "Document clinician workflows, admin responsibilities, and troubleshooting paths.",
  ]},
];

const PRIORITIES = [
  { label:"Alerting and Triage",       value:92, tone:"bg-red-500",    text:"Critical" },
  { label:"Patient + EHR Integration", value:86, tone:"bg-cyan-500",   text:"High" },
  { label:"Feedback + Retraining",     value:78, tone:"bg-purple-500", text:"High" },
  { label:"Deployment Automation",     value:64, tone:"bg-orange-500", text:"Medium" },
];

const FEEDBACK = [
  { label:"Clinician feedback score", value:"4.7 / 5",       detail:"Accuracy, usefulness, relevance, and actionability tracked" },
  { label:"Retraining queue",         value:"34 submissions", detail:"Next threshold-based retraining trigger at 50 submissions" },
  { label:"Model drift watch",        value:"Stable",         detail:"No rollback required across the current validation window" },
];

// ─────────────────────────────────────────────
// TechSkills content (from techskills.html)
// ─────────────────────────────────────────────
const TS_FEATURES = [
  { icon:"📶", title:"Offline First",          desc:"Access courses without internet. Works in low-bandwidth areas, syncs when back online." },
  { icon:"🗣️", title:"Local Language Support", desc:"AI tutor in Swahili, Hausa, Yoruba, and other African languages." },
  { icon:"🎓", title:"Job-Relevant Skills",     desc:"Solar installation, mobile repair, digital literacy, healthcare tech." },
];

const TS_COURSES = [
  { icon:"☀️", title:"Basic Solar Installation",   desc:"Install and maintain solar systems for homes and small businesses.",                  progress:0,  gradient:"linear-gradient(45deg,#78350f,#f59e0b)" },
  { icon:"📱", title:"Smartphone Repair",            desc:"Diagnose and fix common smartphone hardware and software issues.",                     progress:40, gradient:"linear-gradient(45deg,#4c1d95,#8b5cf6)" },
  { icon:"💊", title:"Digital Health Assistant",     desc:"Use digital tools for community health work and rural clinic support.",               progress:42, gradient:"linear-gradient(45deg,#0c4a6e,#38bdf8)" },
  { icon:"💧", title:"Water Purification Tech",      desc:"Install and maintain water purification systems for communities.",                    progress:65, gradient:"linear-gradient(45deg,#0d9488,#14b8a6)" },
  { icon:"🌱", title:"Agri-Tech for Small Farms",    desc:"Smart agriculture with sensors, drones, and precision irrigation.",                   progress:0,  gradient:"linear-gradient(45deg,#14532d,#22c55e)" },
  { icon:"🤖", title:"AI for Small Businesses",      desc:"Leverage AI tools to grow your business and reach new customers.",                    progress:0,  gradient:"linear-gradient(45deg,#6d28d9,#a855f7)" },
  { icon:"📱", title:"Digital Literacy Fundamentals",desc:"Essential skills for smartphones, apps, and online services.",                       progress:40, gradient:"linear-gradient(45deg,#0ea5e9,#38bdf8)" },
  { icon:"🔌", title:"EV Maintenance Basics",        desc:"Diagnose and service electric vehicles with digital diagnostic tools.",               progress:0,  gradient:"linear-gradient(45deg,#065f46,#10b981)" },
];

const TS_HUBS = [
  { name:"Kibera Youth Tech Center",    city:"Nairobi",  amenities:"Free WiFi · Tablets · Mentors",    students:247 },
  { name:"Mathare Digital Hub",         city:"Nairobi",  amenities:"Solar powered · 3D Printer",       students:189 },
  { name:"Mombasa TechSkills Center",   city:"Mombasa",  amenities:"High-speed internet · Lab",        students:312 },
  { name:"Kisumu Innovation Hub",       city:"Kisumu",   amenities:"Free WiFi · Coding bootcamp",      students:156 },
];

const TS_PROGRESS = [
  { course:"Water Purification Tech",   pct:65, color:"#0d9488" },
  { course:"Smartphone Repair",         pct:40, color:"#8b5cf6" },
  { course:"Digital Health Assistant",  pct:42, color:"#0ea5e9" },
  { course:"Digital Literacy Fundamentals", pct:40, color:"#f59e0b" },
];

// ─────────────────────────────────────────────
// OncoAI PWA v3 courses
// ─────────────────────────────────────────────
const ONCO_COURSES = [
  { page:"imaging",   icon:"🖼️", title:"MRI Imaging & Segmentation",    desc:"Upload brain MRI scans, run UNet++ tumour segmentation, review Dice/IoU metrics and segmentation history.",      badge:"BRATS-AFRICA", color:"#3b82f6" },
  { page:"pipeline",  icon:"⚡",  title:"Agentic Pipeline Orchestration", desc:"8-stage multi-agent pipeline: upload → preprocess → Gemini Vision analysis → FHIR R4 clinical report.",         badge:"8 Agents",      color:"#8b5cf6" },
  { page:"treatment", icon:"📈",  title:"DQN Treatment Optimization",     desc:"Deep Q-Network reinforcement learning for oncology treatment selection with IQVIA quintile stratification.",     badge:"DQN + RL",      color:"#10b981" },
  { page:"about",     icon:"🌍",  title:"OncoAI Africa-Ready Platform",   desc:"Offline-first PWA, FHIR R4 compliance, BRATS-AFRICA dataset representation, multi-language ready architecture.", badge:"Offline PWA",   color:"#f59e0b" },
];

const ONCOAI_SRC = "/agents/oncoai-pwa-v3.html";

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
type MainTab = "skills" | "techskills" | "oncoai";
type TsTab   = "dashboard" | "courses" | "hubs" | "progress";

export default function Skills() {
  const [mainTab,  setMainTab]  = useState<MainTab>("skills");
  const [tsTab,    setTsTab]    = useState<TsTab>("dashboard");
  const [oncoPage, setOncoPage] = useState<string | null>(null);
  const [iframeOk, setIframeOk] = useState(false);

  const MAIN_TABS = [
    { id:"skills",    icon:"💡", label:"Clinical Skills" },
    { id:"techskills",icon:"📚", label:"TechSkills Campus" },
    { id:"oncoai",    icon:"🧠", label:"OncoAI Courses" },
  ] as const;

  const TS_TABS = [
    { id:"dashboard", icon:<BookOpen   className="w-4 h-4"/>, label:"Dashboard" },
    { id:"courses",   icon:<Brain      className="w-4 h-4"/>, label:"Courses" },
    { id:"hubs",      icon:<MapPin     className="w-4 h-4"/>, label:"Hubs" },
    { id:"progress",  icon:<BarChart3  className="w-4 h-4"/>, label:"Progress" },
  ] as const;

  return (
    <div className="space-y-4 p-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-1">Skills &amp; Courses</h1>
        <p className="text-slate-400 text-sm">Clinical skills · TechSkills micro-campus · OncoAI oncology modules</p>
      </div>

      {/* Main tab bar */}
      <div className="flex gap-2 border-b border-slate-800">
        {MAIN_TABS.map(t => (
          <button key={t.id} onClick={() => { setMainTab(t.id); setOncoPage(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              mainTab === t.id
                ? "bg-slate-800 text-cyan-400 border border-b-0 border-slate-700"
                : "text-slate-500 hover:text-slate-300"
            }`}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1 — Clinical Skills (jua-kali-platform)
      ══════════════════════════════════════════════ */}
      {mainTab === "skills" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILL_AREAS.map(s => (
              <div key={s.area} className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-5 hover:border-cyan-500/60 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{s.icon}</span>
                  <h3 className="text-base font-bold text-cyan-400 font-mono">{s.area}</h3>
                </div>
                <div className="space-y-3">
                  {s.recommendations.map(r => (
                    <div key={r} className="flex gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-sm leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Priority bars */}
            <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-cyan-400 font-mono">Implementation Priority</h2>
              </div>
              <div className="space-y-4">
                {PRIORITIES.map(p => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm font-mono">{p.label}</span>
                      <span className="text-slate-200 font-bold text-sm">{p.text}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className={`${p.tone} h-2 rounded-full`} style={{ width:`${p.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model health */}
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-5">
              <h2 className="text-base font-bold text-cyan-400 font-mono mb-4">Feedback &amp; Model Health</h2>
              <div className="space-y-3">
                {FEEDBACK.map(h => (
                  <div key={h.label} className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-mono uppercase text-slate-500">{h.label}</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">{h.value}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{h.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2 — TechSkills Micro-Campus
          (full content from techskills.html, inline React)
      ══════════════════════════════════════════════ */}
      {mainTab === "techskills" && (
        <div className="space-y-4">
          {/* Inner tab bar */}
          <div className="flex gap-2 border-b border-slate-700/60 pb-0 flex-wrap">
            {TS_TABS.map(t => (
              <button key={t.id} onClick={() => setTsTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  tsTab === t.id
                    ? "bg-slate-800 text-cyan-400 border border-b-0 border-slate-700"
                    : "text-slate-500 hover:text-slate-300"
                }`}>{t.icon}{t.label}</button>
            ))}
            <a href="/agents/techskills.html" target="_blank" rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs px-3 py-1.5 my-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-300 font-semibold self-center">
              <ExternalLink className="w-3 h-3"/>Full App
            </a>
          </div>

          {/* DASHBOARD */}
          {tsTab === "dashboard" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-blue-300 mb-2">TechSkills Micro-Campus</h2>
                <p className="text-slate-300 text-sm mb-1 font-medium">Contact: Stone-Larry Wanderi · +254 723 910 433 · lwrnckahiga88@gmail.com</p>
                <p className="text-slate-400 text-sm leading-relaxed mt-2 max-w-2xl">
                  Empowering rural and informal economies with accessible tech training. Learn job-relevant
                  skills, connect with local learning hubs, and get AI-powered mentorship — all designed
                  to work offline and in low-bandwidth areas.
                </p>
                <button className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                  onClick={() => setTsTab("courses")}>
                  ▶ Start Learning
                </button>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TS_FEATURES.map(f => (
                  <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="text-3xl mb-3">{f.icon}</div>
                    <h3 className="font-bold text-slate-200 text-sm mb-2">{f.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Popular courses preview */}
              <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">Popular Courses</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {TS_COURSES.slice(0,4).map(c => (
                  <button key={c.title} onClick={() => setTsTab("courses")}
                    className="text-left bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/40 group transition-all">
                    <div className="h-16 flex items-center justify-center text-3xl" style={{ background:c.gradient }}>{c.icon}</div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors leading-tight">{c.title}</p>
                      <p className="text-xs text-cyan-400 font-semibold mt-1">{c.progress > 0 ? `${c.progress}% done` : "Enroll →"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COURSES */}
          {tsTab === "courses" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-700/40 p-4 bg-slate-800/30">
                <h2 className="text-lg font-bold text-slate-200 mb-1">Skills for the Future</h2>
                <p className="text-slate-400 text-sm">Browse job-relevant courses for informal and rural economies. All available offline with certificate on completion.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {TS_COURSES.map(c => (
                  <div key={c.title} className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all group flex flex-col">
                    <div className="h-20 flex items-center justify-center text-4xl" style={{ background:c.gradient }}>{c.icon}</div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-slate-200 text-sm mb-1 group-hover:text-cyan-300 transition-colors leading-tight">{c.title}</h3>
                      <p className="text-slate-500 text-xs mb-3 flex-1 leading-relaxed">{c.desc}</p>
                      {c.progress > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Progress</span><span className="text-cyan-400">{c.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-cyan-500" style={{ width:`${c.progress}%` }} />
                          </div>
                        </div>
                      )}
                      <button className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all mt-auto">
                        {c.progress > 0 ? "Continue →" : "Enroll Now →"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HUBS */}
          {tsTab === "hubs" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-700/40 p-5 bg-slate-800/30 text-center">
                <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-slate-200 mb-2">Find Nearby Training Centers</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Connect with physical learning hubs in your community — equipment, mentors, and high-speed internet.
                </p>
                <button className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold">
                  📍 Enable Location
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TS_HUBS.map(h => (
                  <div key={h.name} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-slate-200 text-sm">{h.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 flex-shrink-0 ml-2">{h.city}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{h.amenities}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{h.students} active students</span>
                      <button className="text-xs px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-all">
                        View Hub →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROGRESS */}
          {tsTab === "progress" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Courses Enrolled", value:"4",    icon:"📚", color:"text-cyan-400" },
                  { label:"Hours Learned",    value:"12.5", icon:"⏱️",  color:"text-purple-400" },
                  { label:"Certificates",     value:"1",    icon:"🎓", color:"text-yellow-400" },
                  { label:"Avg. Score",       value:"87%",  icon:"⭐", color:"text-green-400" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">Course Progress</h3>
              <div className="space-y-3">
                {TS_PROGRESS.map(p => (
                  <div key={p.course} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-200">{p.course}</span>
                      <span className="text-sm font-bold font-mono" style={{ color:p.color }}>{p.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all" style={{ width:`${p.pct}%`, background:p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3 — OncoAI PWA v3 Courses
      ══════════════════════════════════════════════ */}
      {mainTab === "oncoai" && (
        <div className="space-y-4">
          {!oncoPage ? (
            <>
              {/* Hero */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-blue-300 font-mono">OncoAI PWA v3 — Oncology Courses</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                  BRATS-AFRICA brain tumour segmentation · UNet++ nested architecture · Gemini Vision API
                  multimodal analysis · DQN reinforcement learning treatment optimisation.
                  Africa-ready, offline-first, FHIR R4 compliant.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["🧬 BRATS-AFRICA","🤖 UNet++","🔮 Gemini Vision","📊 DQN RL","🌍 Offline PWA","📋 FHIR R4"].map(f => (
                    <span key={f} className="text-xs px-3 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-500/20">{f}</span>
                  ))}
                </div>
              </div>

              {/* Module cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ONCO_COURSES.map(c => (
                  <button key={c.page} onClick={() => { setOncoPage(c.page); setIframeOk(false); }}
                    className="text-left bg-slate-900/60 rounded-xl border hover:scale-[1.01] transition-all group overflow-hidden"
                    style={{ borderColor:`${c.color}30` }}>
                    <div className="h-2 w-full" style={{ background:`linear-gradient(90deg,${c.color},${c.color}60)` }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{c.icon}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold border"
                          style={{ background:`${c.color}15`, color:c.color, borderColor:`${c.color}40` }}>
                          {c.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-200 text-sm mb-2 group-hover:text-white transition-colors leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{c.desc}</p>
                      <span className="text-xs font-bold" style={{ color:c.color }}>Launch Module →</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Full app link */}
              <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <p className="text-slate-200 font-semibold text-sm">Full OncoAI PWA v3 Application</p>
                  <p className="text-slate-500 text-xs">All 4 modules + offline PWA + IndexedDB persistence</p>
                </div>
                <a href={ONCOAI_SRC} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all flex-shrink-0">
                  <ExternalLink className="w-4 h-4" /> Open App
                </a>
              </div>
            </>
          ) : (
            /* ── iframe module viewer ── */
            <div className="flex flex-col rounded-xl overflow-hidden border border-blue-500/30"
              style={{ height:"calc(100vh - 210px)", minHeight:"500px" }}>

              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setOncoPage(null)}
                    className="text-slate-400 hover:text-white text-sm font-semibold flex-shrink-0 flex items-center gap-1">
                    ← Back
                  </button>
                  <div className="min-w-0">
                    <span className="text-blue-300 font-semibold text-sm truncate block">
                      {ONCO_COURSES.find(c => c.page === oncoPage)?.icon}{" "}
                      {ONCO_COURSES.find(c => c.page === oncoPage)?.title}
                    </span>
                    <span className="text-slate-500 text-xs hidden sm:block">OncoAI PWA v3 — {oncoPage}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {!iframeOk && <span className="text-xs text-slate-500 animate-pulse">Loading…</span>}
                  <a href={ONCOAI_SRC} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-semibold">
                    <ExternalLink className="w-3 h-3" /> Full Screen
                  </a>
                </div>
              </div>

              <iframe
                key={oncoPage}
                src={ONCOAI_SRC}
                className="flex-1 w-full border-none"
                title={`OncoAI — ${oncoPage}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-presentation"
                onLoad={e => {
                  setIframeOk(true);
                  try {
                    const win = (e.target as HTMLIFrameElement).contentWindow as any;
                    if (win?.navigateTo) win.navigateTo(oncoPage);
                  } catch (_) {}
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
