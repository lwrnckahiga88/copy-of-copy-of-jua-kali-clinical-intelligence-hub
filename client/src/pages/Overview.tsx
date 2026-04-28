import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Zap, Heart, AlertCircle, TrendingUp } from "lucide-react";

export default function Overview() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    // Show platform overview without blocking — no login required to browse
    return (
      <div className="min-h-screen p-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center py-16">
            <h1 className="text-5xl font-bold text-cyan-400 font-mono mb-4">juA.kali</h1>
            <p className="text-xl text-slate-300 mb-4">Clinical AI Intelligence Hub</p>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto">
              Real-time patient monitoring, predictive care workflows, and 28+ clinical AI agents powered by the StudioOS national health intelligence grid.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {[
                { icon: "🧬", label: "Oncology AI", path: "/health-ai-agents" },
                { icon: "📊", label: "Analytics", path: "/analytics" },
                { icon: "🏥", label: "NurseAI", path: "/nurse-ai" },
                { icon: "⚡", label: "Jarvis", path: "/jarvis" },
                { icon: "🔬", label: "All Agents", path: "/health-ai-agents" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className="px-5 py-3 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-lg font-mono text-sm transition-all"
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-slate-400">
            Clinical AI Intelligence Hub — Real-time monitoring and predictive care
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="cosmic-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Patients</p>
                <p className="text-2xl font-bold text-cyan-300">24</p>
              </div>
              <Heart className="h-8 w-8 text-pink-400 opacity-50" />
            </div>
          </div>

          <div className="cosmic-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-300">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </div>

          <div className="cosmic-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Facilities Online</p>
                <p className="text-2xl font-bold text-purple-300">6</p>
              </div>
              <Zap className="h-8 w-8 text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="cosmic-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Prediction Accuracy</p>
                <p className="text-2xl font-bold text-cyan-300">94%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-cyan-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-300 mb-6">Clinical Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Nexus Dashboard",
                description: "Real-time clinical intelligence grid",
                path: "/nexus-dashboard",
              },
              {
                title: "NurseAI",
                description: "Patient vitals and triage assessment",
                path: "/nurse-ai",
              },
              {
                title: "Intervention Planner",
                description: "Hospital routing and ambulance dispatch",
                path: "/intervention-planner",
              },
              {
                title: "Triad Neuro",
                description: "EEG and neurological analysis",
                path: "/triad-neuro",
              },
              {
                title: "Cerberus BPU",
                description: "Wearable connections and alerts",
                path: "/cerberus-bpu",
              },
              {
                title: "Analytics",
                description: "Predictive analytics and insights",
                path: "/analytics",
              },
            ].map((module) => (
              <button
                key={module.path}
                onClick={() => setLocation(module.path)}
                className="cosmic-panel text-left hover:border-cyan-500/80 hover:bg-slate-800/80 transition-all cursor-pointer group"
              >
                <h3 className="text-lg font-semibold text-cyan-300 group-hover:text-cyan-200 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-slate-400 group-hover:text-slate-300">
                  {module.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="cosmic-panel">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-2">StudioOS Grid</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-slate-300">Operational</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Hospital Network</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-slate-300">6/6 Connected</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Ambulance Fleet</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-slate-300">3/3 Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
