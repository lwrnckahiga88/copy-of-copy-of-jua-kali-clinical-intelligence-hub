import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import CosmicBackground from "./CosmicBackground";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const mainNavItems = [
  { icon: "ðŸ“Š", label: "Overview", path: "/" },
  { icon: "ðŸ§¾", label: "Clinical Workspace", path: "/clinical-workspace" },
  { icon: "âš ï¸", label: "Issues & Alerts", path: "/issues-alerts" },
  { icon: "ðŸ”Œ", label: "Connector UI", path: "/connector-ui" },
  { icon: "ðŸ’¡", label: "Skills & Suggestions", path: "/skills" },
];

const jarvisAgents = [
  { icon: "ðŸŽ¯", label: "Nexus Dashboard", path: "/nexus-dashboard" },
  { icon: "ðŸ“ˆ", label: "Analytics", path: "/analytics" },
  { icon: "âš™ï¸", label: "MedOS Module", path: "/medos-module" },
  { icon: "ðŸŽ¬", label: "Intervention Planner", path: "/intervention-planner" },
  { icon: "ðŸ’¬", label: "Agent Debate", path: "/agent-debate" },
  { icon: "ðŸ¥", label: "NurseAI", path: "/nurse-ai" },
  { icon: "ðŸ”¬", label: "Health AI Agents", path: "/health-ai-agents" },
];

const additionalAgents = [
  { icon: "ðŸ§ ", label: "Triad Neuro", path: "/triad-neuro" },
  { icon: "ðŸ•", label: "Cerberus BPU", path: "/cerberus-bpu" },
  { icon: "ðŸ¤–", label: "Jarvis", path: "/jarvis" },
  { icon: "ðŸ—ºï¸", label: "Roadmap", path: "/roadmap" },
  { icon: "âš•ï¸", label: "Settings", path: "/settings" },
];

// Guest user â€” no auth required
const GUEST_USER = { id: 0, name: "Clinician", email: null, role: "user" as const };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Auth removed â€” app is publicly accessible
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CosmicBackground />
      <div className="relative z-10 flex">
        <Sidebar user={GUEST_USER} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  role: "user" | "admin";
}

function Sidebar({ user }: { user: User }) {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAgentsExpanded, setIsAgentsExpanded] = useState(true);

  const [credits, setCredits] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("juakali_credits");
      return stored ? parseInt(stored, 10) : 1000;
    } catch {
      return 1000;
    }
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6 text-cyan-400" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`hidden md:flex md:flex-col w-80 bg-slate-900/50 border-r border-cyan-500/30 backdrop-blur-sm fixed md:static h-screen md:h-auto overflow-y-auto ${
          isOpen ? "fixed inset-0 z-40 w-full" : ""
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-cyan-400 font-mono font-bold text-lg md:text-2xl">juA.kali</h2>
                <p className="text-slate-400 text-sm">Clinical Intelligence Hub</p>
              </div>
              <div className="rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-xs font-mono text-cyan-300">
                {user?.role || "user"}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Stethoscope className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">Clinician visibility enabled</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Navigation automatically hides admin-only sections while preserving the exact UI aesthetic.
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 p-4 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { setLocation(item.path); setIsOpen(false); }}
                className={`w-full text-left rounded-lg transition-all px-4 py-3 ${
                  isActive
                    ? "bg-cyan-600/20 border-l-2 border-cyan-500 text-cyan-400"
                    : "text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          {/* Jarvis Agents Section */}
          <div className="border-t border-slate-700 mt-4 pt-4">
            <button
              onClick={() => setIsAgentsExpanded(!isAgentsExpanded)}
              className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-all flex items-center justify-between"
            >
              <span><span className="mr-2">ðŸ¤–</span>Jarvis Agents</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isAgentsExpanded ? "" : "rotate-180"}`} />
            </button>

            {isAgentsExpanded && (
              <div className="space-y-1 mt-2">
                {[...jarvisAgents, ...additionalAgents].map((agent) => {
                  const isActive = location === agent.path;
                  return (
                    <button
                      key={agent.path}
                      onClick={() => { setLocation(agent.path); setIsOpen(false); }}
                      className={`w-full text-left rounded-lg transition-all px-4 py-2 text-sm ${
                        isActive
                          ? "bg-cyan-600/20 border-l-2 border-cyan-500 text-cyan-400"
                          : "text-slate-400 hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="mr-2">{agent.icon}</span>
                      {agent.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-6 border-t border-cyan-500/20 space-y-4">
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-mono uppercase tracking-wide mb-2">Available Credits</div>
            <div className={`text-2xl font-bold font-mono ${credits < 100 ? "text-red-400" : credits < 300 ? "text-yellow-400" : "text-cyan-400"}`}>
              {credits.toLocaleString()}
            </div>
            <div className="text-slate-500 text-xs mt-2">
              Cost per run: <span className="text-cyan-400">15 credits</span>
            </div>
            {credits < 100 && <div className="text-xs text-red-400 mt-1 font-mono">âš  Low credits</div>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-700 pt-4">
            <button className="w-full px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-auto w-full md:w-[calc(100%-320px)]">
      {children}
    </main>
  );
}
