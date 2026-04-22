import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Navigation, Ambulance } from "lucide-react";

export default function InterventionPlanner() {
  const { user, isAuthenticated } = useAuth();
  const { data: geoRouting } = trpc.clinicalGrid.getGeoRouting.useQuery(
    { lat: -1.292, lon: 36.822 },
    { enabled: isAuthenticated }
  );
  const { data: fleetStatus } = trpc.clinicalGrid.getFleetStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const dispatchMutation = trpc.clinicalGrid.dispatchAmbulance.useMutation();
  const resetMutation = trpc.clinicalGrid.resetFleet.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Intervention Planner</h1>
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
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Intervention Planner</h1>
          <p className="text-slate-400">Hospital routing and ambulance dispatch coordination</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geo Routing */}
          <div className="cosmic-panel">
            <div className="flex items-center gap-3 mb-6">
              <Navigation className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-300">Nearest Facility Routing</h2>
            </div>

            {geoRouting ? (
              <div className="space-y-3">
                {geoRouting.slice(0, 3).map((hospital) => (
                  <div key={hospital.id} className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-cyan-300">{hospital.name}</h3>
                      <span className="cosmic-badge bg-purple-900/40 text-purple-300 border border-purple-500/50">
                        #{hospital.rank}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Distance</p>
                        <p className="text-cyan-300 font-semibold">{hospital.distanceKm.toFixed(2)} km</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Score</p>
                        <p className="text-cyan-300 font-semibold">{hospital.score.toFixed(3)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Loading routing data...</p>
            )}
          </div>

          {/* Ambulance Dispatch */}
          <div className="cosmic-panel">
            <div className="flex items-center gap-3 mb-6">
              <Ambulance className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-pink-300">Ambulance Dispatch</h2>
            </div>

            {fleetStatus && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {fleetStatus.map((amb) => (
                    <div key={amb.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                      <div>
                        <p className="font-semibold text-cyan-300">{amb.callSign}</p>
                        <p className="text-xs text-slate-400">Lat: {amb.lat.toFixed(3)}, Lon: {amb.lon.toFixed(3)}</p>
                      </div>
                      <span className={`cosmic-badge ${amb.available ? 'cosmic-badge-available' : 'cosmic-badge-busy'}`}>
                        {amb.available ? 'AVAILABLE' : 'DISPATCHED'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => dispatchMutation.mutate()}
                    disabled={dispatchMutation.isPending}
                    className="cosmic-button-primary w-full"
                  >
                    {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Nearest Unit'}
                  </Button>
                  <Button
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    className="cosmic-button-secondary w-full"
                  >
                    {resetMutation.isPending ? 'Resetting...' : 'Reset Fleet'}
                  </Button>
                </div>

                {dispatchMutation.data && (
                  <div className="p-3 bg-slate-800/50 rounded border border-cyan-500/50">
                    <p className="text-sm text-slate-400 mb-2">Last Dispatch</p>
                    <p className="text-cyan-300 font-semibold">{dispatchMutation.data.assignedAmbulance?.callSign}</p>
                    <p className="text-sm text-slate-400 mt-2">ETA: {dispatchMutation.data.eta} minutes</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
