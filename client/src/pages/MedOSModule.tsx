import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Cpu } from "lucide-react";

export default function MedOSModule() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">MedOS Module</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">MedOS Module</h1>
          <p className="text-slate-400">Medical operating system and clinical workflows</p>
        </div>

        <div className="cosmic-panel">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-cyan-300">System Status</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Clinical Engine', status: 'Running', uptime: '99.8%' },
              { name: 'Data Pipeline', status: 'Running', uptime: '99.9%' },
              { name: 'Alert System', status: 'Running', uptime: '99.7%' },
              { name: 'Analytics Engine', status: 'Running', uptime: '99.6%' },
            ].map((sys, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-cyan-300">{sys.name}</span>
                  <span className="cosmic-badge cosmic-badge-available">{sys.status}</span>
                </div>
                <p className="text-xs text-slate-400">Uptime: {sys.uptime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
