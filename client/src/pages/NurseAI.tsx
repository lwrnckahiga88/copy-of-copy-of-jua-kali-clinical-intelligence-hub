import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function NurseAI() {
  const { user, isAuthenticated } = useAuth();
  const [vitals, setVitals] = useState({ heartRate: 75, systolicBP: 120, spo2: 98 });
  const triageMutation = trpc.clinicalGrid.computeTriage.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">NurseAI</h1>
          <p className="text-slate-300 mb-6">Please sign in to access this module</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  const handleComputeTriage = () => {
    triageMutation.mutate(vitals);
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-300';
      case 'HIGH':
        return 'text-orange-300';
      case 'MODERATE':
        return 'text-yellow-300';
      default:
        return 'text-green-300';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-950">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">NurseAI</h1>
          <p className="text-slate-400">Patient vitals assessment and triage engine</p>
        </div>

        {/* Vitals Input */}
        <div className="cosmic-panel mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-6 w-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-pink-300">Vitals Assessment</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Heart Rate (bpm)</label>
              <input
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                className="cosmic-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.systolicBP}
                onChange={(e) => setVitals({ ...vitals, systolicBP: Number(e.target.value) })}
                className="cosmic-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">SpO₂ (%)</label>
              <input
                type="number"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                className="cosmic-input w-full"
              />
            </div>
          </div>

          <Button
            onClick={handleComputeTriage}
            disabled={triageMutation.isPending}
            className="cosmic-button-primary w-full"
          >
            {triageMutation.isPending ? 'Computing...' : 'Compute Triage Score'}
          </Button>
        </div>

        {/* Triage Result */}
        {triageMutation.data && (
          <div className="cosmic-panel">
            <h3 className="text-xl font-bold text-cyan-300 mb-6">Triage Result</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Severity Score</p>
                <p className="text-4xl font-bold text-cyan-300">{triageMutation.data.score}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Severity Level</p>
                <p className={`text-4xl font-bold ${getSeverityColor(triageMutation.data.level)}`}>
                  {triageMutation.data.level}
                </p>
              </div>
            </div>

            {triageMutation.data.flags.length > 0 && (
              <div className="mt-6">
                <p className="text-slate-400 text-sm mb-3">Clinical Flags</p>
                <div className="space-y-2">
                  {triageMutation.data.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-pink-400 mt-1.5 flex-shrink-0"></div>
                      <p className="text-slate-300">{flag}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-slate-800/50 rounded border border-slate-700/50">
              <p className="text-slate-400 text-sm mb-2">Recommendation</p>
              <p className="text-slate-200 font-semibold">{triageMutation.data.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
