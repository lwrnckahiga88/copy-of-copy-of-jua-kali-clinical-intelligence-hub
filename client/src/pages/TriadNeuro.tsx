import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Brain, Zap } from "lucide-react";

export default function TriadNeuro() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Triad Neuro</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Triad Neuro</h1>
          <p className="text-slate-400">EEG and neurological analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cosmic-panel">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-300">EEG Analysis</h2>
            </div>
            <div className="space-y-4">
              {['Alpha Waves', 'Beta Waves', 'Theta Waves', 'Delta Waves'].map((wave, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">{wave}</span>
                    <span className="text-cyan-300 font-semibold">{75 + i * 5}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded h-2">
                    <div
                      className="h-2 rounded bg-cyan-500"
                      style={{ width: `${75 + i * 5}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cosmic-panel">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-pink-300">Neurological Status</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Consciousness Level', value: 'Alert', color: 'text-green-300' },
                { label: 'Seizure Risk', value: 'Low', color: 'text-green-300' },
                { label: 'Cognitive Function', value: 'Normal', color: 'text-green-300' },
                { label: 'Motor Response', value: 'Normal', color: 'text-green-300' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <span className="text-slate-300">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
