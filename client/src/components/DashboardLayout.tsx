import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const mainNavItems = [
  { icon: "📊", label: "Overview",            path: "/" },
  { icon: "🔌", label: "Connector UI",        path: "/connector-ui" },
  { icon: "💡", label: "Skills",              path: "/skills" },
];

const jarvisAgents = [
  { icon: "🎯", label: "Nexus Dashboard",     path: "/nexus-dashboard" },
  { icon: "📈", label: "Analytics",           path: "/analytics" },
  { icon: "⚙️", label: "MedOS Module",        path: "/medos-module" },
  { icon: "🎬", label: "Intervention Planner",path: "/intervention-planner" },
  { icon: "💬", label: "Agent Debate",        path: "/agent-debate" },
  { icon: "🏥", label: "NurseAI",             path: "/nurse-ai" },
  { icon: "🔬", label: "Health AI Agents",    path: "/health-ai-agents" },
  { icon: "🧠", label: "Triad Neuro",         path: "/triad-neuro" },
  { icon: "🐕", label: "Cerberus BPU",        path: "/cerberus-bpu" },
  { icon: "🤖", label: "Jarvis",              path: "/jarvis" },
  { icon: "🗺️", label: "Roadmap",             path: "/roadmap" },
  { icon: "⚕️", label: "Settings",            path: "/settings" },
];

function NavItem({ icon, label, path, active, onClick }: {
  icon: string; label: string; path: string; active: boolean; onClick: () => void;
}) {
  const [, setLocation] = useLocation();
  return (
    <button
      onClick={() => { setLocation(path); onClick(); }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
        active
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
      }`}
    >
      <span className="flex-shrink-0 w-5 text-center">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function Sidebar({ onClose }: { onClose: () => void }) {
  const [location] = useLocation();
  const [agentsExpanded, setAgentsExpanded] = useState(true);
  const { user, logout } = useAuth() as any;

  // Persist credits
  const [credits, setCredits] = useState(() => {
    try { return parseInt(localStorage.getItem("juakali_credits") ?? "1000", 10); }
    catch { return 1000; }
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <div className="text-lg font-bold text-cyan-400 font-mono tracking-wider">juA.kali</div>
          <div className="text-xs text-slate-500">Clinical Intelligence Hub</div>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1 rounded">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {mainNavItems.map(item => (
          <NavItem key={item.path} {...item} active={location === item.path} onClick={onClose} />
        ))}

        {/* Agents section */}
        <div className="pt-2">
          <button
            onClick={() => setAgentsExpanded(e => !e)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
          >
            <span>AI Agents</span>
            <ChevronDown size={14} className={`transition-transform ${agentsExpanded ? "rotate-180" : ""}`} />
          </button>
          {agentsExpanded && (
            <div className="mt-1 space-y-1">
              {jarvisAgents.map(item => (
                <NavItem key={item.path} {...item} active={location === item.path} onClick={onClose} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credits + User */}
      <div className="flex-shrink-0 p-3 border-t border-slate-800 space-y-3">
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Credits</div>
          <div className={`text-xl font-bold font-mono ${credits < 100 ? "text-red-400" : credits < 300 ? "text-yellow-400" : "text-cyan-400"}`}>
            {credits.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 mt-0.5">15 credits / run</div>
        </div>
        {user && (
          <button
            onClick={() => logout?.()}
            className="w-full text-xs text-slate-500 hover:text-slate-300 flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <span>↩</span> Sign out
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (loading) return <DashboardLayoutSkeleton />;

  const isAuthenticated = Boolean(user);
  const isPublicPage = location === "/";

  if (!isAuthenticated && !isPublicPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full text-center">
          <h1 className="text-4xl font-bold text-cyan-400 font-mono">juA.kali</h1>
          <p className="text-sm text-slate-400">
            Clinical AI intelligence hub — sign in to access agents and modules.
          </p>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-over on mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <Menu size={22} />
          </button>
          <span className="text-base font-bold text-cyan-400 font-mono">juA.kali</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
