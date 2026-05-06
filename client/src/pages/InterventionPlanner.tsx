import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Navigation, Ambulance, Clock, CheckCircle2 } from "lucide-react";

export default function InterventionPlanner() {
  const { user, isAuthenticated } = useAuth();
  
  // Geo routing and ambulance dispatch queries
  const { data: geoRouting, isLoading: geoLoading } = trpc.clinicalGrid.getGeoRouting.useQuery(
    { lat: -1.292, lon: 36.822 },
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Intervention Planner</h1>
          <p className="text-slate-400">Clinical intervention scheduling, hospital routing, and ambulance dispatch coordination</p>
        </div>

        {/* Active Interventions Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-slate-400">SCHEDULED</h3>
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">8</div>
            <p className="text-xs text-slate-500">Upcoming interventions</p>
          </div>

          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-slate-400">IN PROGRESS</h3>
              <AlertCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">3</div>
            <p className="text-xs text-slate-500">Currently executing</p>
          </div>

          <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-slate-400">COMPLETED</h3>
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">24</div>
            <p className="text-xs text-slate-500">This month</p>
          </div>
        </div>

        {/* Geo Routing & Ambulance Dispatch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geo Routing */}
          <div className="cosmic-panel bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Navigation className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-300">Nearest Facility Routing</h2>
            </div>

            {geoLoading ? (
              <p className="text-slate-400">Loading routing data...</p>
            ) : geoRouting ? (
              <div className="space-y-3">
                {geoRouting.slice(0, 3).map((hospital: any) => (
                  <div key={hospital.id} className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-cyan-300">{hospital.name}</h3>
                      <span className="cosmic-badge bg-purple-900/40 text-purple-300 border border-purple-500/50 px-2 py-1 rounded text-xs">
                        #{hospital.rank}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Distance</p>
                        <p className="text-cyan-300 font-semibold">{hospital.distanceKm?.toFixed(2) || 'N/A'} km</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Score</p>
                        <p className="text-cyan-300 font-semibold">{hospital.score?.toFixed(3) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No routing data available</p>
            )}
          </div>

          {/* Ambulance Dispatch */}
          <div className="cosmic-panel bg-slate-800/50 border border-pink-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Ambulance className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-pink-300">Ambulance Dispatch</h2>
            </div>

            {fleetLoading ? (
              <p className="text-slate-400">Loading fleet status...</p>
            ) : fleetStatus ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {fleetStatus.map((amb: any) => (
                    <div key={amb.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700/50">
                      <div>
                        <p className="font-semibold text-cyan-300">{amb.callSign}</p>
                        <p className="text-xs text-slate-400">Lat: {amb.lat?.toFixed(3) || 'N/A'}, Lon: {amb.lon?.toFixed(3) || 'N/A'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        amb.available 
                          ? 'bg-green-900/40 text-green-300 border border-green-500/50' 
                          : 'bg-red-900/40 text-red-300 border border-red-500/50'
                      }`}>
                        {amb.available ? 'AVAILABLE' : 'DISPATCHED'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => dispatchMutation.mutate()}
                    disabled={dispatchMutation.isPending}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded"
                  >
                    {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Nearest Unit'}
                  </Button>
                  <Button
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded"
                  >
                    {resetMutation.isPending ? 'Resetting...' : 'Reset Fleet'}
                  </Button>
                </div>

                {dispatchMutation.data && (
                  <div className="p-3 bg-slate-900/50 rounded border border-cyan-500/50">
                    <p className="text-sm text-slate-400 mb-2">Last Dispatch</p>
                    <p className="text-cyan-300 font-semibold">{dispatchMutation.data.assignedAmbulance?.callSign || 'N/A'}</p>
                    <p className="text-sm text-slate-400 mt-2">ETA: {dispatchMutation.data.eta || 'N/A'} minutes</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">No fleet data available</p>
            )}
          </div>
        </div>

        {/* Intervention Timeline */}
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-400 font-mono mb-4">Today's Interventions</h2>
          <div className="space-y-4">
            {[
              {
                time: "09:00",
                intervention: "Morning Labs",
                patient: "MRN-45021",
                status: "completed",
                team: "Lab Team",
              },
              {
                time: "10:30",
                intervention: "Physical Therapy",
                patient: "MRN-45008",
                status: "in-progress",
                team: "PT Department",
              },
              {
                time: "12:00",
                intervention: "Medication Review",
                patient: "MRN-45015",
                status: "scheduled",
                team: "Pharmacy",
              },
              {
                time: "14:00",
                intervention: "Imaging Study",
                patient: "MRN-45032",
                status: "scheduled",
                team: "Radiology",
              },
              {
                time: "16:00",
                intervention: "Consultation",
                patient: "MRN-45045",
                status: "scheduled",
                team: "Cardiology",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 font-mono text-sm">{item.time}</span>
                      <h3 className="text-slate-200 font-semibold">{item.intervention}</h3>
                    </div>
                    <p className="text-xs text-slate-500">{item.patient} • {item.team}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-mono font-semibold ${
                    item.status === "completed" ? "bg-green-900/30 text-green-400" :
                    item.status === "in-progress" ? "bg-cyan-900/30 text-cyan-400" :
                    "bg-slate-700/50 text-slate-300"
                  }`}>
                    {item.status === "completed" ? "✓ Done" :
                     item.status === "in-progress" ? "→ Active" :
                     "Scheduled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Care Team */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 font-mono mb-4">Care Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { role: "Primary Physician", name: "Dr. Sarah Chen", status: "online" },
              { role: "Nurse Coordinator", name: "James Kipchoge", status: "online" },
              { role: "Specialist", name: "Dr. Amara Okafor", status: "offline" },
            ].map((member, idx) => (
              <div key={idx} className="bg-slate-900/50 p-4 rounded border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">{member.role}</p>
                <p className="text-slate-200 font-semibold mb-2">{member.name}</p>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  member.status === "online" 
                    ? "bg-green-900/30 text-green-400" 
                    : "bg-slate-700/50 text-slate-400"
                }`}>
                  {member.status === "online" ? "● Online" : "● Offline"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Interventions */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 font-mono mb-4">Quick Interventions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {["+ Order Labs", "+ Schedule Imaging", "+ Consult Specialist", "+ Update Medications"].map((action, idx) => (
              <Button
                key={idx}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 rounded"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Interventions */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 font-mono mb-4">Recent Interventions</h2>
          <div className="space-y-2">
            {[
              "Completed: Medication Review (MRN-45021) - 2 hours ago",
              "Completed: Vital Signs Check (MRN-45008) - 4 hours ago",
              "Completed: Lab Results Review (MRN-45015) - 6 hours ago",
            ].map((item, idx) => (
              <div key={idx} className="text-sm text-slate-400 py-2 border-b border-slate-700/50 last:border-b-0">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
