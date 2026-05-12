import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Ambulance, Clock, AlertCircle } from "lucide-react";

/**
 * Intervention Planner Agent
 * Hospital routing and ambulance dispatch coordination
 */
export default function InterventionPlannerAgent() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const cases = [
    {
      id: "C001",
      patient: "John Doe",
      condition: "Acute MI",
      priority: "critical",
      location: "Downtown",
      nearestFacility: "Central Hospital",
      distance: 2.3,
      eta: 8,
    },
    {
      id: "C002",
      patient: "Jane Smith",
      condition: "Stroke",
      priority: "high",
      location: "Westside",
      nearestFacility: "St. Mary's Hospital",
      distance: 3.5,
      eta: 12,
    },
    {
      id: "C003",
      patient: "Robert Johnson",
      condition: "Trauma",
      priority: "critical",
      location: "Highway 101",
      nearestFacility: "Trauma Center",
      distance: 5.1,
      eta: 15,
    },
  ];

  const currentCase = cases.find((c) => c.id === selectedCase);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 border-red-500 text-red-400";
      case "high":
        return "bg-orange-500/20 border-orange-500 text-orange-400";
      case "medium":
        return "bg-yellow-500/20 border-yellow-500 text-yellow-400";
      default:
        return "bg-green-500/20 border-green-500 text-green-400";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 font-mono">
            Intervention Planner
          </h1>
          <p className="text-slate-400 mt-2">
            Hospital routing and ambulance dispatch coordination
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Active Cases</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{cases.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-cyan-500/30">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Cases</h2>
            <div className="space-y-2">
              {cases.map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedCase === caseItem.id
                      ? "bg-cyan-600/20 border-l-2 border-cyan-500"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="font-semibold text-slate-100">
                    {caseItem.patient}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {caseItem.condition}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
                        caseItem.priority
                      )}`}
                    >
                      {caseItem.priority.toUpperCase()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Case Details */}
        {currentCase && (
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                  Patient Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-400">Name</div>
                      <div className="font-semibold text-slate-100 mt-1">
                        {currentCase.patient}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Condition</div>
                      <div className="font-semibold text-slate-100 mt-1">
                        {currentCase.condition}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Location</div>
                      <div className="font-semibold text-slate-100 mt-1">
                        {currentCase.location}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${getPriorityColor(currentCase.priority)}`}>
                        {currentCase.priority.toUpperCase()} PRIORITY
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Routing */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Recommended Facility
                </h3>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-semibold text-slate-100">
                        {currentCase.nearestFacility}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        Nearest facility with appropriate resources
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">
                        {currentCase.distance} km
                      </div>
                      <div className="text-xs text-slate-400">Distance</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Clock className="w-4 h-4" />
                    ETA: {currentCase.eta} minutes
                  </div>
                </div>
              </div>
            </Card>

            {/* Dispatch */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <Ambulance className="w-5 h-5" />
                  Ambulance Dispatch
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-100">
                        Unit 42 - Advanced Life Support
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 font-semibold">
                        DISPATCHED
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      ETA: 4 minutes • Location: Downtown Station
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-100">
                        Unit 15 - Basic Life Support
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 font-semibold">
                        AVAILABLE
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      ETA: 7 minutes • Location: Westside Station
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!currentCase && (
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Ambulance className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a case to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Network Status */}
      <Card className="bg-slate-900/50 border-cyan-500/30">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Hospital Network Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Central Hospital", beds: 45, status: "available" },
              { name: "St. Mary's Hospital", beds: 12, status: "limited" },
              { name: "Trauma Center", beds: 8, status: "critical" },
            ].map((hospital) => (
              <div
                key={hospital.name}
                className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50"
              >
                <div className="font-semibold text-slate-100">{hospital.name}</div>
                <div className="text-2xl font-bold text-cyan-400 mt-2">
                  {hospital.beds}
                </div>
                <div className="text-xs text-slate-400 mt-1">Available beds</div>
                <div className={`text-xs mt-2 font-semibold ${
                  hospital.status === "available"
                    ? "text-green-400"
                    : hospital.status === "limited"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}>
                  {hospital.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
