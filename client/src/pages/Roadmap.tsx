import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Map } from "lucide-react";

export default function Roadmap() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Roadmap</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Roadmap</h1>
          <p className="text-slate-400">Product development and feature pipeline</p>
        </div>

        <div className="cosmic-panel">
          <div className="flex items-center gap-3 mb-6">
            <Map className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-purple-300">Upcoming Features</h2>
          </div>

          <div className="space-y-4">
            {[
              { quarter: 'Q2 2026', features: ['Real-time Video Consultation', 'Advanced Predictive Models'] },
              { quarter: 'Q3 2026', features: ['Mobile App Launch', 'Blockchain Integration'] },
              { quarter: 'Q4 2026', features: ['AI-Powered Diagnosis', 'Global Network Expansion'] },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded border border-slate-700/50">
                <h3 className="font-semibold text-cyan-300 mb-2">{item.quarter}</h3>
                <ul className="space-y-1">
                  {item.features.map((feature, j) => (
                    <li key={j} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
