import { CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";

export default function InterventionPlanner() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-green-400 font-mono mb-2">Intervention Planner</h1>
        <p className="text-slate-400">Clinical intervention scheduling and care coordination</p>
      </div>

      {/* Active Interventions */}
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

      {/* Care Team Coordination */}
      <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-purple-400 font-mono">Care Team</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { role: "Primary Physician", name: "Dr. Sarah Chen", status: "online" },
            { role: "Nursing", name: "RN James Wilson", status: "online" },
            { role: "Physical Therapy", name: "PT Maria Rodriguez", status: "offline" },
            { role: "Pharmacy", name: "PharmD David Kim", status: "online" },
            { role: "Cardiology", name: "Dr. Michael Zhang", status: "online" },
            { role: "Case Management", name: "CM Patricia Brown", status: "offline" },
          ].map((member, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-slate-200 font-semibold text-sm">{member.role}</h3>
                <p className="text-xs text-slate-500">{member.name}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                member.status === "online" ? "bg-green-400" : "bg-slate-600"
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention Templates */}
      <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-orange-400 font-mono mb-4">Quick Interventions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Order Labs",
            "Schedule Imaging",
            "Medication Adjustment",
            "Consultation Request",
            "Physical Therapy",
            "Discharge Planning",
          ].map((template, idx) => (
            <button
              key={idx}
              className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-300 hover:bg-orange-900/20 hover:border-orange-500/30 hover:text-orange-400 transition text-sm font-semibold"
            >
              + {template}
            </button>
          ))}
        </div>
      </div>

      {/* Intervention History */}
      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 font-mono mb-4">Recent Interventions</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
            { time: "Yesterday 16:45", action: "Completed: Medication Review", patient: "MRN-45021" },
            { time: "Yesterday 14:20", action: "Completed: Physical Therapy Session", patient: "MRN-45008" },
            { time: "Yesterday 10:00", action: "Completed: Lab Work", patient: "MRN-45015" },
            { time: "2 days ago 15:30", action: "Completed: Cardiology Consultation", patient: "MRN-45032" },
            { time: "2 days ago 09:00", action: "Completed: Imaging Study", patient: "MRN-45045" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg text-sm">
              <span className="text-slate-500 font-mono min-w-fit">{item.time}</span>
              <div>
                <p className="text-slate-300">{item.action}</p>
                <p className="text-xs text-slate-500">{item.patient}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
