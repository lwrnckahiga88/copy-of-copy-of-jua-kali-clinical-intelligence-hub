import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2, Clock, AlertCircle, Users,
  Navigation, Ambulance, Activity
} from "lucide-react";

export default function InterventionPlanner() {
  const [activeTab, setActiveTab] = useState<"schedule" | "dispatch">("schedule");

  // Geo routing & fleet (from uploaded version)
  const { data: geoRouting } = trpc.clinicalGrid.getGeoRouting.useQuery({ lat: -1.292, lon: 36.822 });
  const { data: fleetStatus } = trpc.clinicalGrid.getFleetStatus.useQuery();
  const dispatchMutation = trpc.clinicalGrid.dispatchAmbulance.useMutation();
  const resetMutation = trpc.clinicalGrid.resetFleet.useMutation();

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-green-400 font-mono mb-1">
          Intervention Planner
        </h1>
        <p className="text-slate-400">
          Clinical intervention scheduling · Hospital routing · Ambulance dispatch
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "SCHEDULED",   value: "8",  color: "text-green-400",  border: "border-green-500/30",  Icon: Clock },
          { label: "IN PROGRESS", value: "3",  color: "text-cyan-400",   border: "border-cyan-500/30",   Icon: Activity },
          { label: "COMPLETED",   value: "24", color: "text-purple-400", border: "border-purple-500/30", Icon: CheckCircle2 },
          { label: "UNITS AVAIL", value: fleetStatus ? String(fleetStatus.filter((a: any) => a.available).length) : "…",
            color: "text-pink-400", border: "border-pink-500/30", Icon: Ambulance },
        ].map(({ label, value, color, border, Icon }) => (
          <div key={label} className={`bg-slate-800/50 border ${border} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-slate-800 pb-0">
        {(["schedule", "dispatch"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-all ${
              activeTab === tab
                ? "bg-slate-800 text-cyan-400 border border-b-0 border-slate-700"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab === "schedule" ? "📋 Care Schedule" : "🚑 Dispatch & Routing"}
          </button>
        ))}
      </div>

      {activeTab === "schedule" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-5">
            <h2 className="text-lg font-bold text-cyan-400 font-mono mb-4">Today's Interventions</h2>
            <div className="space-y-3">
              {[
                { time: "09:00", intervention: "Morning Labs",       patient: "MRN-45021", status: "completed",   team: "Lab Team" },
                { time: "10:30", intervention: "Physical Therapy",   patient: "MRN-45008", status: "in-progress", team: "PT Dept" },
                { time: "12:00", intervention: "Medication Review",  patient: "MRN-45015", status: "scheduled",   team: "Pharmacy" },
                { time: "14:00", intervention: "Imaging Study",      patient: "MRN-45032", status: "scheduled",   team: "Radiology" },
                { time: "16:00", intervention: "Consultation",       patient: "MRN-45045", status: "scheduled",   team: "Cardiology" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-xs">{item.time}</span>
                        <span className="text-slate-200 font-semibold text-sm">{item.intervention}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.patient} · {item.team}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                      item.status === "completed"   ? "bg-green-900/30 text-green-400" :
                      item.status === "in-progress" ? "bg-cyan-900/30 text-cyan-400" :
                      "bg-slate-700/50 text-slate-300"
                    }`}>
                      {item.status === "completed" ? "✓ Done" : item.status === "in-progress" ? "→ Active" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Care team + Quick interventions */}
          <div className="space-y-5">
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-purple-400" />
                <h2 className="text-lg font-bold text-purple-400 font-mono">Care Team</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { role: "Primary Physician", name: "Dr. Sarah Chen",       status: "online" },
                  { role: "Nursing",           name: "RN James Wilson",      status: "online" },
                  { role: "Physical Therapy",  name: "PT Maria Rodriguez",   status: "offline" },
                  { role: "Pharmacy",          name: "PharmD David Kim",     status: "online" },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-slate-200 text-sm font-semibold">{m.role}</p>
                      <p className="text-xs text-slate-500">{m.name}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.status === "online" ? "bg-green-400" : "bg-slate-600"}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-5">
              <h2 className="text-lg font-bold text-orange-400 font-mono mb-3">Quick Interventions</h2>
              <div className="grid grid-cols-2 gap-2">
                {["Order Labs","Schedule Imaging","Medication Adjust","Consultation","Physical Therapy","Discharge Plan"].map(t => (
                  <button key={t} className="p-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-300 hover:bg-orange-900/20 hover:border-orange-500/30 hover:text-orange-400 transition text-xs font-semibold text-left">
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "dispatch" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geo routing */}
          <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5">
              <Navigation className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-purple-300 font-mono">Nearest Facility</h2>
              <span className="text-xs text-slate-500 ml-auto font-mono">Nairobi (-1.292, 36.822)</span>
            </div>

            {geoRouting ? (
              <div className="space-y-3">
                {(geoRouting as any[]).slice(0, 4).map((hosp: any) => (
                  <div key={hosp.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-cyan-300 text-sm">{hosp.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/40 font-mono">
                        #{hosp.rank}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Distance</p>
                        <p className="text-cyan-300 font-semibold">{hosp.distanceKm?.toFixed(2)} km</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Score</p>
                        <p className="text-cyan-300 font-semibold">{hosp.score?.toFixed(3)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm animate-pulse py-8 text-center">Loading routing data…</div>
            )}
          </div>

          {/* Ambulance dispatch */}
          <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5">
              <Ambulance className="w-5 h-5 text-pink-400" />
              <h2 className="text-lg font-bold text-pink-300 font-mono">Ambulance Dispatch</h2>
            </div>

            {fleetStatus ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {(fleetStatus as any[]).map((amb: any) => (
                    <div key={amb.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                      <div>
                        <p className="font-semibold text-cyan-300 text-sm">{amb.callSign}</p>
                        <p className="text-xs text-slate-500">
                          {amb.lat?.toFixed(3)}, {amb.lon?.toFixed(3)}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded font-mono font-semibold ${
                        amb.available
                          ? "bg-green-900/30 text-green-400 border border-green-500/30"
                          : "bg-red-900/30 text-red-400 border border-red-500/30"
                      }`}>
                        {amb.available ? "AVAILABLE" : "DISPATCHED"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => dispatchMutation.mutate()}
                    disabled={dispatchMutation.isPending}
                    className="w-full py-2.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
                  >
                    {dispatchMutation.isPending ? "Dispatching…" : "🚑 Dispatch Nearest Unit"}
                  </button>
                  <button
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:cursor-not-allowed text-slate-200 text-sm font-semibold transition-all"
                  >
                    {resetMutation.isPending ? "Resetting…" : "↺ Reset Fleet"}
                  </button>
                </div>

                {dispatchMutation.data && (
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-cyan-500/40">
                    <p className="text-xs text-slate-400 mb-1">Last Dispatch</p>
                    <p className="text-cyan-300 font-semibold text-sm">
                      {(dispatchMutation.data as any).assignedAmbulance?.callSign}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      ETA: {(dispatchMutation.data as any).eta} min
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-sm animate-pulse py-8 text-center">Loading fleet status…</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
