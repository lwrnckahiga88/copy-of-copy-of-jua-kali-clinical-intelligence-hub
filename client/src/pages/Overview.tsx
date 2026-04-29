import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

const RAW = "https://raw.githubusercontent.com/lwrnckahiga88/health-ai/main/public";

const QUICK_AGENTS = [
  { id:"nurse-ai", label:"🩺 NurseAI", file:"NurseAI.html", desc:"Patient vitals & triage" },
  { id:"k-emci", label:"🚑 K-EMCI", file:"K-EMCI.html", desc:"Emergency care + M-PESA" },
  { id:"genomica", label:"🧬 Genomica", file:"Genomica.html", desc:"Genomic analysis" },
  { id:"chemworkbench", label:"⚗️ ChemWorkbench", file:"Chemworkbench.html", desc:"Clinical chemistry" },
  { id:"pandemic-seird", label:"🦠 SEIRD Model", file:"pandemicseird1.html", desc:"Epidemic intelligence" },
  { id:"langflow", label:"🔀 LangFlow", file:"langflowbuildersaas.html", desc:"AI pipeline builder" },
  { id:"quorum-deep", label:"🧠 QuorumDeep", file:"QuorumDeep.html", desc:"Clinical AI reasoning" },
  { id:"techskills", label:"📚 TechSkills", file:"techskills.html", desc:"Medical education" },
];

const STATS = [
  { label:"Clinical Agents", value:"49" },
  { label:"Hospital Nodes", value:"3" },
  { label:"AI Models", value:"12+" },
  { label:"M-PESA Ready", value:"✓" },
];

export default function Overview() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeAgent, setActiveAgent] = useState<string|null>(null);
  const [iframeUrl, setIframeUrl] = useState<string|null>(null);

  function launchAgent(file: string) {
    setIframeUrl(`${RAW}/${file}`);
    setActiveAgent(file);
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#0f172a", color:"#e5e7eb",
      fontFamily:"system-ui, sans-serif", padding:0, margin:0,
    }}>
      {/* Header */}
      <header style={{
        background:"#020617", padding:"1rem",
        borderBottom:"1px solid #1e293b",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <h1 style={{margin:0, color:"#06b6d4", fontSize:"1.5rem", fontWeight:700, letterSpacing:"0.05em"}}>
            juA.kali
          </h1>
          <small style={{color:"#64748b"}}>Clinical Intelligence Hub · Kenya</small>
        </div>
        <div style={{display:"flex", gap:"0.5rem"}}>
          <button onClick={()=>setLocation("/health-ai-agents")} style={btnStyle("#06b6d4")}>
            All Agents
          </button>
          <button onClick={()=>setLocation("/jarvis")} style={btnStyle("#2563eb")}>
            Jarvis
          </button>
          {!isAuthenticated && (
            <button onClick={()=>setLocation("/login")} style={btnStyle("#374151")}>
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Stats bar */}
      <div style={{
        background:"#020617", display:"flex", gap:0,
        borderBottom:"1px solid #1e293b",
      }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            flex:1, padding:"0.75rem 1rem", textAlign:"center",
            borderRight:"1px solid #1e293b",
          }}>
            <div style={{color:"#06b6d4", fontWeight:700, fontSize:"1.25rem"}}>{s.value}</div>
            <div style={{color:"#64748b", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.05em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex", height:"calc(100vh - 120px)"}}>
        {/* Sidebar */}
        <aside style={{
          width:"260px", background:"#020617",
          borderRight:"1px solid #1e293b",
          overflowY:"auto", padding:"1rem", flexShrink:0,
        }}>
          <p style={{color:"#64748b", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.75rem"}}>
            Quick Launch
          </p>
          {QUICK_AGENTS.map(a => (
            <button key={a.id} onClick={()=>launchAgent(a.file)} style={{
              width:"100%", textAlign:"left", background: activeAgent===a.file ? "#0f172a" : "transparent",
              border: activeAgent===a.file ? "1px solid #06b6d4" : "1px solid #1e293b",
              borderRadius:"10px", padding:"0.75rem", marginBottom:"0.5rem",
              cursor:"pointer", color:"#e5e7eb", transition:"all 0.15s",
            }}>
              <div style={{fontWeight:600, fontSize:"0.85rem"}}>{a.label}</div>
              <div style={{color:"#64748b", fontSize:"0.75rem", marginTop:"0.2rem"}}>{a.desc}</div>
            </button>
          ))}
          <div style={{marginTop:"1rem", borderTop:"1px solid #1e293b", paddingTop:"1rem"}}>
            <button onClick={()=>setLocation("/health-ai-agents")} style={{...btnStyle("#06b6d4"), width:"100%"}}>
              Browse All 49 Agents →
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{flex:1, overflowY:"auto"}}>
          {iframeUrl ? (
            <div style={{position:"relative", height:"100%"}}>
              <div style={{
                position:"absolute", top:"0.75rem", right:"0.75rem", zIndex:10,
                display:"flex", gap:"0.5rem",
              }}>
                <button onClick={()=>{setIframeUrl(null);setActiveAgent(null);}} style={btnStyle("#374151")}>
                  ✕ Close
                </button>
                <a href={iframeUrl} target="_blank" rel="noopener noreferrer" style={btnStyle("#2563eb")}>
                  ↗ Open
                </a>
              </div>
              <iframe
                src={iframeUrl}
                style={{width:"100%", height:"100%", border:"none"}}
                title="Clinical Agent"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            <div style={{padding:"2rem"}}>
              {/* Hero */}
              <div style={{
                background:"#020617", borderRadius:"12px",
                padding:"2rem", marginBottom:"1.5rem",
                border:"1px solid #1e293b",
              }}>
                <h2 style={{color:"#06b6d4", marginTop:0, fontSize:"1.75rem"}}>
                  National Clinical AI Infrastructure
                </h2>
                <p style={{color:"#94a3b8", lineHeight:1.6, marginBottom:"1.5rem"}}>
                  49 clinical AI agents spanning oncology, pandemic intelligence, genomics,
                  emergency care, and clinical workflows — built for Kenya and East Africa.
                  Offline-first, M-PESA integrated, and SHIF-ready.
                </p>
                <div style={{display:"flex", gap:"0.75rem", flexWrap:"wrap"}}>
                  <button onClick={()=>launchAgent("K-EMCI.html")} style={btnStyle("#16a34a")}>
                    🚑 Launch Emergency Care
                  </button>
                  <button onClick={()=>launchAgent("NurseAI.html")} style={btnStyle("#06b6d4")}>
                    🩺 Launch NurseAI
                  </button>
                  <button onClick={()=>setLocation("/jarvis")} style={btnStyle("#2563eb")}>
                    ⚡ Open Jarvis
                  </button>
                </div>
              </div>

              {/* Agent grid */}
              <div style={{
                display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
                gap:"1rem",
              }}>
                {QUICK_AGENTS.map(a => (
                  <div key={a.id} onClick={()=>launchAgent(a.file)} style={{
                    background:"#020617", borderRadius:"12px", padding:"1rem",
                    border:"1px solid #1e293b", cursor:"pointer",
                    transition:"border-color 0.15s",
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor="#06b6d4")}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor="#1e293b")}
                  >
                    <div style={{fontSize:"1.5rem", marginBottom:"0.5rem"}}>{a.label.split(" ")[0]}</div>
                    <div style={{fontWeight:600, color:"#e5e7eb", marginBottom:"0.25rem"}}>{a.label.slice(3)}</div>
                    <div style={{color:"#64748b", fontSize:"0.8rem"}}>{a.desc}</div>
                    <div style={{
                      marginTop:"0.75rem", color:"#06b6d4", fontSize:"0.75rem",
                      fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em",
                    }}>Launch →</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background:bg, border:"none", borderRadius:"8px",
    padding:"0.6rem 1rem", color:"white", fontWeight:600,
    fontSize:"0.8rem", cursor:"pointer", whiteSpace:"nowrap" as const,
  };
}
