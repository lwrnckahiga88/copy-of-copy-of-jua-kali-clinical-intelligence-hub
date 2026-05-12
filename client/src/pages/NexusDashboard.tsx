import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Zap, AlertCircle } from "lucide-react";

export default function NexusDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: networkStatus, isLoading } = trpc.clinicalGrid.getNetworkStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Nexus Dashboard</h1>
          <p className="text-slate-300 mb-6">Please sign in to access this module</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return 'cosmic-badge-critical-status';
      case 'busy':
        return 'cosmic-badge-busy';
      default:
        return 'cosmic-badge-available';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Nexus Dashboard</h1>
          <p className="text-slate-400">Real-time clinical intelligence grid powered by StudioOS</p>
        </div>

        {/* Hospital Network Status */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-purple-300">Hospital Network Status</h2>
          </div>

          {isLoading ? (
            <div className="cosmic-panel text-center py-8">
              <p className="text-slate-400">Loading network status...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkStatus?.map((hospital) => (
                <div key={hospital.id} className="cosmic-panel">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-cyan-300">{hospital.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">ID: {hospital.id}</p>
                    </div>
                    <span className={`cosmic-badge ${getStatusBadge(hospital.status)}`}>
                      {hospital.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Occupancy</span>
                      <span className="text-sm font-semibold text-cyan-300">{hospital.load}%</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded h-2">
                      <div
                        className={`h-2 rounded transition-all ${
                          hospital.load >= 80
                            ? 'bg-red-500'
                            : hospital.load >= 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${hospital.load}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Rank: #{hospital.rank}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Network Summary */}
        <div className="cosmic-panel">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-pink-400" />
            <h3 className="text-xl font-bold text-pink-300">Network Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-2">Total Facilities</p>
              <p className="text-3xl font-bold text-cyan-300">6</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Available</p>
              <p className="text-3xl font-bold text-green-300">
                {networkStatus?.filter((h) => h.status === 'available').length || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Busy</p>
              <p className="text-3xl font-bold text-yellow-300">
                {networkStatus?.filter((h) => h.status === 'busy').length || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Critical</p>
              <p className="text-3xl font-bold text-red-300">
                {networkStatus?.filter((h) => h.status === 'critical').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
