/**
 * HealthAIAgents — Full catalog of 49+ health-ai HTML agents
 * Design: K-EMCI minimal dark system (#0f172a / #020617 / #06b6d4)
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";

const RAW = "https://raw.githubusercontent.com/lwrnckahiga88/health-ai/main/public";

// Category metadata
const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  "medical-ai":   { label:"Medical AI",        icon:"🧠", color:"#06b6d4" },
  "pandemic":     { label:"Pandemic Intel",     icon:"🦠", color:"#f59e0b" },
  "clinical":     { label:"Clinical Tools",     icon:"🔬", color:"#8b5cf6" },
  "workflow":     { label:"Workflow Builders",  icon:"🔀", color:"#2563eb" },
  "prediction":   { label:"Prediction Models",  icon:"📊", color:"#06b6d4" },
  "simulation":   { label:"Simulation",         icon:"⚡", color:"#16a34a" },
  "financial":    { label:"Health Finance",     icon:"💰", color:"#f59e0b" },
  "services":     { label:"Services",           icon:"🏥", color:"#06b6d4" },
  "media":        { label:"Media",              icon:"🎥", color:"#64748b" },
  "info":         { label:"Information",        icon:"ℹ️",  color:"#64748b" },
};

export default function HealthAIAgents() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeAgent, setActiveAgent] = useState<{name:string; url:string} | null>(null);

  const { data, isLoading } = trpc.healthAiAgents.fetchAll.useQuery();
  const agents = data?.agents ?? [];

  const categories = useMemo(() => {
    const cats = new Set(agents.map((a: any) => a.category));
    return ["all", ...Array.from(cats)];
  }, [agents]);

  const filtered = useMemo(() => agents.filter((a: any) => {
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [agents, activeCategory, search]);

  return (
    <div style={{minHeight:"100vh", background:"#0f172a", color:"#e5e7eb", fontFamily:"system-ui, sans-serif"}}>
      {/* Top bar */}
      <header style={{background:"#020617", padding:"1rem", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap"}}>
        <div>
          <h2 style={{margin:0, color:"#06b6d4", fontSize:"1.1rem", fontWeight:700}}>Health AI Agents</h2>
          <small style={{color:"#64748b"}}>{agents.length} modules · health-ai repo</small>
        </div>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search agents..."
          style={{
            flex:1, minWidth:"200px", background:"#0f172a",
            border:"1px solid #1e293b", borderRadius:"8px",
            padding:"0.6rem 1rem", color:"#e5e7eb", fontSize:"0.9rem",
          }}
        />
        {activeAgent && (
          <button onClick={()=>setActiveAgent(null)} style={btn("#374151")}>✕ Close viewer</button>
        )}
      </header>

      <div style={{display:"flex", height:"calc(100vh - 65px)"}}>
        {/* Category sidebar */}
        <aside style={{width:"180px", background:"#020617", borderRight:"1px solid #1e293b", overflowY:"auto", padding:"0.75rem", flexShrink:0}}>
          {categories.map(cat => {
            const meta = CATEGORY_META[cat] ?? { label: cat, icon:"📌", color:"#64748b" };
            const isAll = cat === "all";
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={()=>setActiveCategory(cat)} style={{
                width:"100%", textAlign:"left",
                background: active ? "#0f172a" : "transparent",
                border: active ? `1px solid ${isAll ? "#06b6d4" : meta.color}` : "1px solid transparent",
                borderRadius:"8px", padding:"0.6rem 0.75rem",
                marginBottom:"0.35rem", cursor:"pointer", color: active ? "#e5e7eb" : "#94a3b8",
                fontSize:"0.8rem", transition:"all 0.15s",
              }}>
                <span>{isAll ? "🗂" : meta.icon}</span>{" "}
                <span style={{fontWeight: active ? 600 : 400}}>
                  {isAll ? "All Agents" : meta.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main panel */}
        <main style={{flex:1, display:"flex", overflow:"hidden"}}>
          {/* Agent grid */}
          <div style={{
            width: activeAgent ? "320px" : "100%",
            overflowY:"auto", padding:"1rem",
            flexShrink:0, transition:"width 0.2s",
            borderRight: activeAgent ? "1px solid #1e293b" : "none",
          }}>
            {isLoading ? (
              <div style={{textAlign:"center", padding:"3rem", color:"#64748b"}}>
                <div style={{fontSize:"2rem", marginBottom:"1rem"}}>⚡</div>
                Loading agents...
              </div>
            ) : (
              <div style={{
                display:"grid",
                gridTemplateColumns: activeAgent ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
                gap:"0.75rem",
              }}>
                {filtered.map((agent: any) => {
                  const meta = CATEGORY_META[agent.category] ?? { color:"#64748b", icon:"📌", label:agent.category };
                  const isActive = activeAgent?.name === agent.name;
                  const hasHtml = agent.htmlUrl || agent.htmlFile;
                  return (
                    <div
                      key={agent.id}
                      onClick={()=> hasHtml && setActiveAgent({
                        name: agent.name,
                        url: agent.htmlUrl ?? `${RAW}/${agent.htmlFile}`,
                      })}
                      style={{
                        background:"#020617", borderRadius:"12px", padding:"0.875rem",
                        border: isActive ? `1px solid ${meta.color}` : "1px solid #1e293b",
                        cursor: hasHtml ? "pointer" : "default",
                        transition:"border-color 0.15s",
                        opacity: hasHtml ? 1 : 0.5,
                      }}
                      onMouseEnter={e=>hasHtml && (e.currentTarget.style.borderColor=meta.color)}
                      onMouseLeave={e=>!isActive && (e.currentTarget.style.borderColor="#1e293b")}
                    >
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.4rem"}}>
                        <span style={{fontSize:"1.3rem"}}>{agent.icon ?? meta.icon}</span>
                        <span style={{
                          fontSize:"0.65rem", padding:"0.2rem 0.5rem", borderRadius:"99px",
                          background:`${meta.color}20`, color:meta.color, fontWeight:600,
                          textTransform:"uppercase", letterSpacing:"0.04em",
                        }}>{meta.label}</span>
                      </div>
                      <div style={{fontWeight:600, fontSize:"0.85rem", marginBottom:"0.2rem", color:"#e5e7eb"}}>{agent.name}</div>
                      <div style={{color:"#64748b", fontSize:"0.75rem", lineHeight:1.4}}>{agent.description}</div>
                      {hasHtml && (
                        <div style={{marginTop:"0.6rem", color:meta.color, fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em"}}>
                          Launch →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Iframe viewer */}
          {activeAgent && (
            <div style={{flex:1, position:"relative", background:"#020617"}}>
              <div style={{
                position:"absolute", top:"0.75rem", right:"0.75rem", zIndex:10,
                display:"flex", gap:"0.5rem",
              }}>
                <a href={activeAgent.url} target="_blank" rel="noopener" style={btn("#2563eb")}>↗ New Tab</a>
                <button onClick={()=>setActiveAgent(null)} style={btn("#374151")}>✕</button>
              </div>
              <iframe
                key={activeAgent.url}
                src={activeAgent.url}
                style={{width:"100%", height:"100%", border:"none"}}
                title={activeAgent.name}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return {
    background:bg, border:"none", borderRadius:"8px", padding:"0.5rem 0.875rem",
    color:"white", fontWeight:600, fontSize:"0.75rem", cursor:"pointer",
  };
}
