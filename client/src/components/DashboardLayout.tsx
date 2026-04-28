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
  const [location] = useLocation();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  // Allow public access to Overview page
  const isPublicPage = location === "/";
  const isAuthenticated = Boolean(user);

  if (!isAuthenticated && !isPublicPage) {
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
      {/* Rest of the component remains the same */}
      {children}
    </div>
  );
}
