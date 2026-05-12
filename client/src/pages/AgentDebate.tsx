import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { MessageSquare } from "lucide-react";

export default function AgentDebate() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Agent Debate</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Agent Debate</h1>
          <p className="text-slate-400">Multi-agent clinical decision framework</p>
        </div>

        <div className="cosmic-panel">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-purple-300">Active Debates</h2>
          </div>

          <div className="space-y-4">
            {[
              { topic: 'Treatment Protocol Selection', agents: 3, consensus: '67%' },
              { topic: 'Risk Assessment Methodology', agents: 4, consensus: '82%' },
              { topic: 'Resource Allocation Strategy', agents: 2, consensus: '91%' },
            ].map((debate, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-cyan-300">{debate.topic}</h3>
                  <span className="cosmic-badge cosmic-badge-available">
                    {debate.agents} agents
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded h-2">
                  <div
                    className="h-2 rounded bg-purple-500"
                    style={{ width: `${debate.consensus}` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Consensus: {debate.consensus}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
