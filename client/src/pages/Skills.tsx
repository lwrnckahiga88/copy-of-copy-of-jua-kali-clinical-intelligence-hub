import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { BookOpen } from "lucide-react";

export default function Skills() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Skills</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Skills</h1>
          <p className="text-slate-400">AI agent capabilities and training modules</p>
        </div>

        <div className="cosmic-panel">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-cyan-300">Available Skills</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { skill: 'Clinical Diagnosis', level: 'Advanced', usage: '2,450' },
              { skill: 'Patient Monitoring', level: 'Expert', usage: '3,890' },
              { skill: 'Treatment Planning', level: 'Advanced', usage: '1,670' },
              { skill: 'Risk Assessment', level: 'Expert', usage: '4,120' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-cyan-300">{item.skill}</span>
                  <span className="cosmic-badge cosmic-badge-available">{item.level}</span>
                </div>
                <p className="text-xs text-slate-400">Used {item.usage} times</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
