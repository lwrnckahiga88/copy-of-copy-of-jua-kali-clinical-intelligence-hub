import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, Heart, AlertCircle, TrendingUp } from "lucide-react";

export default function Overview() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-2xl px-6">
          <h1 className="text-5xl font-bold text-glow-cyan mb-4">juA.kali</h1>
          <p className="text-xl text-slate-300 mb-8">
            Clinical AI Intelligence Hub
          </p>
          <p className="text-slate-400 mb-12">
            Real-time patient monitoring, alert management, and predictive care workflows powered by StudioOS national health intelligence grid.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="cosmic-button-primary text-lg px-8 py-6"
          >
            Sign in with Manus
          </Button>
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
