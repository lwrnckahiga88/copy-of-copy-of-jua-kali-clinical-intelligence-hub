import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  HelpCircle,
  Zap,
  Heart,
  AlertCircle,
  Brain,
  Compass,
  MessageSquare,
  Cpu,
  TrendingUp,
  Plug,
  Wand2,
  Stethoscope,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import CosmicBackground from "./CosmicBackground";

// Main navigation items
const mainNavItems = [
  { icon: "📊", label: "Overview", path: "/" },
  { icon: "🧾", label: "Clinical Workspace", path: "/clinical-workspace" },
  { icon: "⚠️", label: "Issues & Alerts", path: "/issues-alerts" },
  { icon: "🔌", label: "Connector UI", path: "/connector-ui" },
  { icon: "💡", label: "Skills & Suggestions", path: "/skills" },
];

// Jarvis Agents (collapsible section)
const jarvisAgents = [
  { icon: "🎯", label: "Nexus Dashboard", path: "/nexus-dashboard" },
  { icon: "📈", label: "Analytics", path: "/analytics" },
  { icon: "⚙️", label: "MedOS Module", path: "/medos-module" },
  { icon: "🎬", label: "Intervention Planner", path: "/intervention-planner" },
  { icon: "💬", label: "Agent Debate", path: "/agent-debate" },
  { icon: "🏥", label: "NurseAI", path: "/nurse-ai" },
  { icon: "🔬", label: "Health AI Agents", path: "/health-ai-agents" },
];

// Additional agents (hidden by default, shown in expanded menu)
const additionalAgents = [
  { icon: "🧠", label: "Triad Neuro", path: "/triad-neuro" },
  { icon: "🐕", label: "Cerberus BPU", path: "/cerberus-bpu" },
  { icon: "🤖", label: "Jarvis", path: "/jarvis" },
  { icon: "🗺️", label: "Roadmap", path: "/roadmap" },
  { icon: "⚕️", label: "Settings", path: "/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <canvas
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        />
        <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-4xl font-bold text-cyan-400 text-center font-mono">
              juA.kali
            </h1>
            <p className="text-sm text-slate-300 text-center max-w-sm">
              Clinical AI intelligence hub for alerts, patient monitoring, connector orchestration, and predictive care workflows.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CosmicBackground />
      <div className="relative z-10 flex">
        <Sidebar user={user} />
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
  const { logout } = useAuth();

  // Persistent credits via localStorage
  const [credits, setCredits] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("juakali_credits");
      return stored ? parseInt(stored, 10) : 1000;
    } catch {
      return 1000;
    }
  });

  const deductCredit = useCallback((amount = 15) => {
    setCredits((prev) => {
      const next = Math.max(0, prev - amount);
      try { localStorage.setItem("juakali_credits", String(next)); } catch {}
      return next;
    });
  }, []);

  const activeItem = mainNavItems.find((item) => item.path === location);
  const isAgentActive = jarvisAgents.some((agent) => agent.path === location);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-cyan-400" />
          ) : (
            <Menu className="w-6 h-6 text-cyan-400" />
          )}
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
                <h2 className="text-cyan-400 font-mono font-bold text-lg md:text-2xl">
                  juA.kali
                </h2>
                <p className="text-slate-400 text-sm">Clinical Intelligence Hub</p>
              </div>
              <div className="rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-xs font-mono text-cyan-300">
                {user?.role || "user"}
              </div>
            </div>
          </div>

          {/* Clinician Visibility Info */}
          <div className="rounded-lg border border-cyan-500/20 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Stethoscope className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">Clinician visibility enabled</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Navigation automatically hides admin-only sections while preserving the exact UI aesthetic you already preferred.
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
                onClick={() => {
                  setLocation(item.path);
                  setIsOpen(false);
                }}
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
              <span>
                <span className="mr-2">🤖</span>Jarvis Agents
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isAgentsExpanded ? "" : "rotate-180"
                }`}
              />
            </button>

            {isAgentsExpanded && (
              <div className="space-y-1 mt-2">
                {jarvisAgents.map((agent) => {
                  const isActive = location === agent.path;
                  return (
                    <button
                      key={agent.path}
                      onClick={() => {
                        setLocation(agent.path);
                        setIsOpen(false);
                      }}
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

                {/* Additional Agents */}
                {additionalAgents.map((agent) => {
                  const isActive = location === agent.path;
                  return (
                    <button
                      key={agent.path}
                      onClick={() => {
                        setLocation(agent.path);
                        setIsOpen(false);
                      }}
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

        {/* Footer Section */}
        <div className="mt-auto p-6 border-t border-cyan-500/20 space-y-4">
          {/* Credits Display */}
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-mono uppercase tracking-wide mb-2">
              Available Credits
            </div>
            <div className={`text-2xl font-bold font-mono ${credits < 100 ? "text-red-400" : credits < 300 ? "text-yellow-400" : "text-cyan-400"}`}>
              {credits.toLocaleString()}
            </div>
            <div className="text-slate-500 text-xs mt-2">
              Cost per run: <span className="text-cyan-400">15 credits</span>
            </div>
            {credits < 100 && (
              <div className="text-xs text-red-400 mt-1 font-mono">⚠ Low credits</div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 border-t border-slate-700 pt-4">
            <button className="w-full px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={logout}
              className="w-full px-4 py-2 rounded-lg text-red-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
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
