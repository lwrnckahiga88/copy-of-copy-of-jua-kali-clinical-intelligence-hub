import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

export default function Analytics() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Analytics</h1>
          <p className="text-slate-300 mb-6">Please sign in to access this module</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Analytics</h1>
          <p className="text-slate-400">Predictive analytics and clinical insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="cosmic-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-cyan-300">Prediction Accuracy</h3>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-cyan-300">94.2%</p>
            <p className="text-xs text-slate-400 mt-2">↑ 2.3% from last week</p>
          </div>

          <div className="cosmic-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-300">Patient Outcomes</h3>
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-300">87.6%</p>
            <p className="text-xs text-slate-400 mt-2">Positive trend</p>
          </div>

          <div className="cosmic-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-pink-300">Alert Precision</h3>
              <BarChart3 className="h-5 w-5 text-pink-400" />
            </div>
            <p className="text-3xl font-bold text-pink-300">91.8%</p>
            <p className="text-xs text-slate-400 mt-2">↑ 1.1% improvement</p>
          </div>
        </div>

        <div className="cosmic-panel">
          <h3 className="text-xl font-bold text-cyan-300 mb-6">Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Early Detection Rate', value: '89%', trend: '+3%' },
              { label: 'False Positive Rate', value: '8.2%', trend: '-1.2%' },
              { label: 'Average Response Time', value: '4.2 min', trend: '-0.8 min' },
              { label: 'Patient Satisfaction', value: '92%', trend: '+2%' },
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-300">{metric.label}</span>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-cyan-300">{metric.value}</span>
                  <span className="text-xs text-green-400">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
