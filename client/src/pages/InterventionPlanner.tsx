import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Navigation, Ambulance, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function InterventionPlanner() {
  const { user, isAuthenticated } = useAuth();
  const [incidentLat] = useState(-1.292);
  const [incidentLon] = useState(36.822);
  const [selectedPriority, setSelectedPriority] = useState("high");

  const { data: geoRouting, isLoading: geoLoading } = trpc.clinicalGrid.getGeoRouting.useQuery(
    { lat: incidentLat, lon: incidentLon },
    { enabled: isAuthenticated }
  );

  const { data: fleetStatus, isLoading: fleetLoading } = trpc.clinicalGrid.getFleetStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const dispatchMutation = trpc.clinicalGrid.dispatchAmbulance.useMutation();
  const resetMutation = trpc.clinicalGrid.resetFleet.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center">
          <Ambulance className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Intervention Planner</h1>
          <p className="text-slate-300 mb-6">Emergency response coordination system</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-cyan-600 hover:bg-cyan-700">
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Ambulance className="h-8 w-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Intervention Planner</h1>
          </div>
          <p className="text-slate-400">Hospital routing and ambulance dispatch coordination</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Geo Routing Panel */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-300">Nearest Facility Routing</h2>
            </div>

            {geoLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-700/30 p-4 rounded animate-pulse h-24" />
                ))}
              </div>
            ) : geoRouting && geoRouting.length > 0 ? (
              <div className="space-y-3">
                {geoRouting.slice(0, 3).map((hospital) => (
                  <div key={hospital.id} className="bg-slate-800/50 p-4 rounded border border-slate-700/50 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-cyan-300">{hospital.name}</h3>
                      <span className="px-3 py-1 bg-purple-900/40 text-purple-300 border border-purple-500/50 rounded text-sm font-semibold">
                        #{hospital.rank}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Distance</p>
                        <p className="text-cyan-300 font-semibold">{hospital.distanceKm.toFixed(2)} km</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Beds Available</p>
                        <p className="text-cyan-300 font-semibold">{hospital.availableBeds}/{hospital.capacity}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Score</p>
                        <p className="text-cyan-300 font-semibold">{hospital.score.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No hospitals found in range</p>
            )}
          </Card>

          {/* Ambulance Dispatch Panel */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Ambulance className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-pink-300">Ambulance Dispatch</h2>
            </div>

            {fleetLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-700/30 p-3 rounded animate-pulse h-16" />
                ))}
              </div>
            ) : fleetStatus && fleetStatus.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {fleetStatus.map((amb) => (
                    <div key={amb.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                      <div>
                        <p className="font-semibold text-cyan-300">{amb.callSign}</p>
                        <p className="text-xs text-slate-400">
                          Lat: {amb.lat.toFixed(3)}, Lon: {amb.lon.toFixed(3)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        amb.available
                          ? "bg-green-900/40 text-green-300 border border-green-500/50"
                          : "bg-red-900/40 text-red-300 border border-red-500/50"
                      }`}>
                        {amb.available ? "AVAILABLE" : "DISPATCHED"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Priority Selection */}
                <div className="bg-slate-700/30 p-3 rounded border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-2">Incident Priority</p>
                  <div className="grid grid-cols-4 gap-2">
                    {["low", "medium", "high", "critical"].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setSelectedPriority(priority)}
                        className={`py-2 px-2 rounded text-xs font-semibold transition-colors ${
                          selectedPriority === priority
                            ? priority === "critical"
                              ? "bg-red-600 text-white"
                              : priority === "high"
                              ? "bg-orange-600 text-white"
                              : priority === "medium"
                              ? "bg-yellow-600 text-white"
                              : "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => dispatchMutation.mutate({ priority: selectedPriority as any })}
                    disabled={dispatchMutation.isPending}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2"
                  >
                    {dispatchMutation.isPending ? "Dispatching..." : "Dispatch Nearest Unit"}
                  </Button>
                  <Button
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2"
                  >
                    {resetMutation.isPending ? "Resetting..." : "Reset Fleet"}
                  </Button>
                </div>

                {/* Dispatch Result */}
                {dispatchMutation.data && (
                  <div className="p-4 bg-green-900/20 rounded border border-green-500/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-300 mb-2">Dispatch Confirmed</p>
                        <p className="text-cyan-300 font-semibold">{dispatchMutation.data.assignedAmbulance?.callSign}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>ETA: {dispatchMutation.data.eta} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {dispatchMutation.isError && (
                  <div className="p-4 bg-red-900/20 rounded border border-red-500/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-300">Dispatch Failed</p>
                        <p className="text-xs text-slate-400 mt-1">Please try again</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">No ambulances available</p>
            )}
          </Card>
        </div>

        {/* Incident Location Info */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-blue-300">Incident Location</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Latitude</p>
              <p className="text-cyan-300 font-semibold">{incidentLat}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Longitude</p>
              <p className="text-cyan-300 font-semibold">{incidentLon}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
