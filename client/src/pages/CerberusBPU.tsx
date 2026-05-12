import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Watch, AlertTriangle, Zap } from "lucide-react";

export default function CerberusBPU() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Cerberus BPU</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Cerberus BPU</h1>
          <p className="text-slate-400">Wearable connections and clinical alerts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cosmic-panel">
            <div className="flex items-center gap-3 mb-6">
              <Watch className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-cyan-300">Connected Wearables</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Apple Watch Series 8', status: 'Connected', signal: '95%' },
                { name: 'Fitbit Sense 2', status: 'Connected', signal: '88%' },
                { name: 'Oura Ring Gen 3', status: 'Connected', signal: '92%' },
              ].map((device, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-cyan-300">{device.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{device.status}</p>
                    </div>
                    <span className="cosmic-badge cosmic-badge-available">{device.signal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cosmic-panel">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-pink-300">Active Alerts</h2>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Elevated Heart Rate', time: '2 min ago', severity: 'HIGH' },
                { title: 'Sleep Disruption Detected', time: '15 min ago', severity: 'MODERATE' },
                { title: 'Activity Level Low', time: '1 hour ago', severity: 'LOW' },
              ].map((alert, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-200">{alert.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                    </div>
                    <span className={`cosmic-badge ${
                      alert.severity === 'HIGH' ? 'cosmic-badge-high' : 
                      alert.severity === 'MODERATE' ? 'cosmic-badge-moderate' : 
                      'cosmic-badge-low'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
