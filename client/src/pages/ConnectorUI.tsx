import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Plug } from "lucide-react";

export default function ConnectorUI() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Connector UI</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Connector UI</h1>
          <p className="text-slate-400">Third-party integrations and data connectors</p>
        </div>

        <div className="cosmic-panel">
          <div className="flex items-center gap-3 mb-6">
            <Plug className="h-6 w-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-pink-300">Active Connectors</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Epic EHR', status: 'Connected', records: '12,450' },
              { name: 'HL7 Gateway', status: 'Connected', records: '8,920' },
              { name: 'FHIR API', status: 'Connected', records: '5,340' },
              { name: 'Wearable Sync', status: 'Connected', records: '3,210' },
            ].map((conn, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-cyan-300">{conn.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{conn.records} records synced</p>
                  </div>
                  <span className="cosmic-badge cosmic-badge-available">{conn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
