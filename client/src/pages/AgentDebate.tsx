import { MessageCircle, Users, CheckCircle, AlertCircle } from "lucide-react";

export default function AgentDebate() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 font-mono mb-2">Agent Debate</h1>
        <p className="text-slate-400">Multi-agent clinical reasoning and consensus building</p>
      </div>

      {/* Active Debates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">ACTIVE DEBATES</h3>
            <MessageCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400 mb-2">3</div>
          <p className="text-xs text-slate-500">Ongoing discussions</p>
        </div>

        <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">CONSENSUS REACHED</h3>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">12</div>
          <p className="text-xs text-slate-500">This week</p>
        </div>

        <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">AGENTS ACTIVE</h3>
            <Users className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-2">8</div>
          <p className="text-xs text-slate-500">Specialized agents</p>
        </div>
      </div>

      {/* Current Debate */}
      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 font-mono mb-4">Case: MRN-45021 - Sepsis Diagnosis</h2>
        <div className="space-y-4">
          {[
            {
              agent: "Infectious Disease AI",
              stance: "SUPPORTS",
              confidence: 92,
              reasoning: "Elevated lactate (4.2 mmol/L), fever (38.9°C), tachycardia (110 bpm), and positive blood cultures strongly indicate sepsis. SIRS criteria met.",
              color: "text-green-400",
              bgColor: "bg-green-900/20",
              borderColor: "border-green-500/30",
            },
            {
              agent: "Pulmonary Specialist",
              stance: "SUPPORTS",
              confidence: 85,
              reasoning: "Respiratory involvement evident with elevated respiratory rate and infiltrates on CXR. Consistent with sepsis-induced ARDS.",
              color: "text-green-400",
              bgColor: "bg-green-900/20",
              borderColor: "border-green-500/30",
            },
            {
              agent: "Cardiology AI",
              stance: "CAUTION",
              confidence: 78,
              reasoning: "While sepsis likely, cardiac involvement must be ruled out. Recommend troponin and echocardiography to exclude septic cardiomyopathy.",
              color: "text-yellow-400",
              bgColor: "bg-yellow-900/20",
              borderColor: "border-yellow-500/30",
            },
            {
              agent: "Nephrology AI",
              stance: "SUPPORTS",
              confidence: 88,
              reasoning: "Elevated creatinine (1.8 mg/dL) and oliguria suggest sepsis-induced acute kidney injury. Early intervention critical.",
              color: "text-green-400",
              bgColor: "bg-green-900/20",
              borderColor: "border-green-500/30",
            },
          ].map((item, idx) => (
            <div key={idx} className={`${item.bgColor} border ${item.borderColor} rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-200">{item.agent}</h3>
                  <span className={`text-sm font-mono ${item.color}`}>{item.stance}</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${item.color}`}>{item.confidence}%</div>
                  <p className="text-xs text-slate-500">Confidence</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">{item.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Consensus Summary */}
      <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-purple-400 font-mono mb-4">Consensus Summary</h2>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-semibold">Overall Consensus</span>
            <span className="text-green-400 font-mono font-bold">SEPSIS CONFIRMED</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: "88%" }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">88% agent agreement</p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h3 className="text-green-400 font-semibold text-sm mb-1">Recommended Action</h3>
            <p className="text-sm text-slate-300">Initiate broad-spectrum antibiotic therapy immediately. Fluid resuscitation protocol. Monitor lactate clearance.</p>
          </div>

          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <h3 className="text-yellow-400 font-semibold text-sm mb-1">Additional Testing</h3>
            <p className="text-sm text-slate-300">Troponin, echocardiography, and repeat lactate in 2-4 hours to assess treatment response.</p>
          </div>
        </div>
      </div>

      {/* Agent Profiles */}
      <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-orange-400 font-mono mb-4">Active Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Infectious Disease AI", status: "Active", cases: 247, accuracy: 94 },
            { name: "Cardiology AI", status: "Active", cases: 189, accuracy: 91 },
            { name: "Pulmonary Specialist", status: "Active", cases: 156, accuracy: 89 },
            { name: "Nephrology AI", status: "Active", cases: 134, accuracy: 92 },
            { name: "Gastroenterology AI", status: "Standby", cases: 98, accuracy: 87 },
            { name: "Neurology AI", status: "Standby", cases: 112, accuracy: 90 },
          ].map((agent, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-200">{agent.name}</h3>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  agent.status === "Active" 
                    ? "bg-green-900/30 text-green-400" 
                    : "bg-slate-700/50 text-slate-400"
                }`}>
                  {agent.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{agent.cases} cases</span>
                <span>{agent.accuracy}% accuracy</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debate History */}
      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 font-mono mb-4">Recent Debates</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
            { case: "MRN-45021", topic: "Sepsis vs SIRS", resolution: "Sepsis Confirmed", time: "Today 10:45" },
            { case: "MRN-45008", topic: "Medication Interaction", resolution: "Consensus Reached", time: "Today 09:30" },
            { case: "MRN-45015", topic: "Diagnostic Approach", resolution: "Consensus Reached", time: "Yesterday 14:20" },
            { case: "MRN-45032", topic: "Treatment Plan", resolution: "Consensus Reached", time: "Yesterday 11:00" },
            { case: "MRN-45045", topic: "Discharge Criteria", resolution: "Consensus Reached", time: "2 days ago" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg text-sm">
              <div>
                <p className="text-slate-300 font-semibold">{item.case} - {item.topic}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
              <span className="text-green-400 text-xs font-mono">✓ {item.resolution}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
