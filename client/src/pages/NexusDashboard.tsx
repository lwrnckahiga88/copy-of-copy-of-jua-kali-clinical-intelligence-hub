import { Activity, Brain, AlertCircle, Users, Zap, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NexusDashboard() {
  // Fetch health-AI metrics from server
  const { data: metrics, isLoading: metricsLoading } = trpc.healthAI.getMetrics.useQuery();
  const { data: health, isLoading: healthLoading } = trpc.healthAI.health.useQuery();

  const systemMetrics = metrics || {
    auth: { loginAttempts: 1247, tokenValidations: 5892, successRate: 98.5 },
    agents: { active: 8, totalRuns: 3421, averageRunTime: 2.3 },
    system: { uptime: 99.99, requestsPerSecond: 145, errorRate: 0.01 },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-2">Nexus Dashboard</h1>
        <p className="text-slate-400">Real-time clinical intelligence hub and system overview</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">SYSTEM STATUS</h3>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">✓ Operational</div>
          <p className="text-xs text-slate-500">All systems nominal</p>
        </div>

        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">ACTIVE PROTOCOLS</h3>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">{systemMetrics.agents.active}</div>
          <p className="text-xs text-slate-500">Clinical workflows running</p>
        </div>

        <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">ALERT QUEUE</h3>
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-2">7</div>
          <p className="text-xs text-slate-500">Pending review</p>
        </div>

        <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">PATIENTS MONITORED</h3>
            <Users className="w-5 h-5 text-pink-400" />
          </div>
          <div className="text-3xl font-bold text-pink-400 mb-2">128</div>
          <p className="text-xs text-slate-500">Across 4 facilities</p>
        </div>
      </div>

      {/* Real-time Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Intelligence */}
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 font-mono mb-4">Clinical Intelligence</h2>
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-cyan-400 font-semibold">Sepsis Risk Detection</h3>
                  <p className="text-sm text-slate-400">Patient ID: MRN-45021</p>
                </div>
                <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded font-mono">HIGH</span>
              </div>
              <p className="text-sm text-slate-300">Elevated lactate + fever + tachycardia pattern detected</p>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded hover:bg-cyan-600/40 transition">Review</button>
                <button className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded hover:bg-slate-700 transition">Dismiss</button>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-purple-400 font-semibold">Medication Interaction Alert</h3>
                  <p className="text-sm text-slate-400">Patient ID: MRN-45008</p>
                </div>
                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded font-mono">MEDIUM</span>
              </div>
              <p className="text-sm text-slate-300">Warfarin + NSAIDs interaction risk identified</p>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded hover:bg-cyan-600/40 transition">Review</button>
                <button className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded hover:bg-slate-700 transition">Dismiss</button>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance - Health-AI Metrics */}
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-400 font-mono mb-4">System Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">API Response Time</span>
                <span className="text-green-400 font-mono text-sm">45ms</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">System Uptime</span>
                <span className="text-green-400 font-mono text-sm">{systemMetrics.system.uptime}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemMetrics.system.uptime}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Auth Success Rate</span>
                <span className="text-green-400 font-mono text-sm">{systemMetrics.auth.successRate}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemMetrics.auth.successRate}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Requests/sec</span>
                <span className="text-blue-400 font-mono text-sm">{systemMetrics.system.requestsPerSecond}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health-AI Services Status */}
      <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-green-400 font-mono mb-4">Health-AI Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {health?.services && Object.entries(health.services).map(([service, status]: [string, any]) => (
            <div key={service} className="bg-slate-900/50 rounded-lg p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-mono text-slate-400 capitalize">{service}</p>
                <p className="text-lg font-bold text-green-400">{status.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Statistics */}
      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 font-mono mb-4">Agent Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-2">Total Agent Runs</p>
            <p className="text-4xl font-bold text-cyan-400">{systemMetrics.agents.totalRuns}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Average Run Time</p>
            <p className="text-4xl font-bold text-purple-400">{systemMetrics.agents.averageRunTime}s</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Login Attempts</p>
            <p className="text-4xl font-bold text-pink-400">{systemMetrics.auth.loginAttempts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
