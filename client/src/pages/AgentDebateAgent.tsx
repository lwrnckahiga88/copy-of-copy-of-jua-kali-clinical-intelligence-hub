import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, CheckCircle, Clock } from "lucide-react";

/**
 * Agent Debate Agent
 * Multi-agent clinical decision support system
 */
export default function AgentDebateAgent() {
  const [selectedDebate, setSelectedDebate] = useState<string | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const debates = [
    {
      id: "D001",
      case: "Patient with chest pain",
      status: "active",
      consensus: 75,
      agents: ["DiagnosticAI", "CardiacSpecialist", "TriageEngine"],
    },
    {
      id: "D002",
      case: "Treatment plan for diabetes",
      status: "completed",
      consensus: 92,
      agents: ["EndocrinologyAI", "NutritionAI", "PharmacyAI"],
    },
    {
      id: "D003",
      case: "Surgical intervention decision",
      status: "active",
      consensus: 68,
      agents: ["SurgicalAI", "AnesthesiaAI", "RiskAssessment"],
    },
  ];

  const currentDebate = debates.find((d) => d.id === selectedDebate);

  const agentOpinions = [
    {
      id: "agent1",
      name: "DiagnosticAI",
      opinion: "Acute coronary syndrome likely",
      confidence: 92,
      reasoning: "ECG changes and troponin elevation indicate cardiac event",
      recommendation: "Immediate cardiology consultation",
    },
    {
      id: "agent2",
      name: "CardiacSpecialist",
      opinion: "Unstable angina with atypical presentation",
      confidence: 85,
      reasoning: "Patient history and symptom pattern suggest unstable angina",
      recommendation: "Cardiac catheterization within 24 hours",
    },
    {
      id: "agent3",
      name: "TriageEngine",
      opinion: "High-risk patient requiring ICU monitoring",
      confidence: 88,
      reasoning: "Multiple risk factors and vital sign abnormalities present",
      recommendation: "ICU admission with continuous monitoring",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 font-mono">
            Agent Debate
          </h1>
          <p className="text-slate-400 mt-2">
            Multi-agent clinical decision support system
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Active Debates</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {debates.filter((d) => d.status === "active").length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debates List */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-cyan-500/30">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Debates</h2>
            <div className="space-y-2">
              {debates.map((debate) => (
                <button
                  key={debate.id}
                  onClick={() => setSelectedDebate(debate.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedDebate === debate.id
                      ? "bg-cyan-600/20 border-l-2 border-cyan-500"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="font-semibold text-slate-100">{debate.case}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        debate.status === "active" ? "bg-green-500" : "bg-slate-500"
                      }`}
                    ></div>
                    <span className="text-xs text-slate-400">{debate.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {debate.agents.length} agents
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Debate Details */}
        {currentDebate && (
          <div className="lg:col-span-2 space-y-6">
            {/* Consensus */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                  {currentDebate.case}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">Agent Consensus</span>
                      <span className="text-cyan-400 font-semibold">
                        {currentDebate.consensus}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        style={{ width: `${currentDebate.consensus}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                      <div className="text-sm text-slate-400">Agents</div>
                      <div className="text-2xl font-bold text-cyan-400 mt-1">
                        {currentDebate.agents.length}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                      <div className="text-sm text-slate-400">Status</div>
                      <div className="text-sm font-semibold text-green-400 mt-1">
                        {currentDebate.status}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                      <div className="text-sm text-slate-400">Agreement</div>
                      <div className="text-sm font-semibold text-cyan-400 mt-1">
                        High
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Agent Opinions */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Agent Opinions
                </h3>
                <div className="space-y-3">
                  {agentOpinions.map((agent) => (
                    <div
                      key={agent.id}
                      className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50"
                    >
                      <button
                        onClick={() =>
                          setExpandedAgent(
                            expandedAgent === agent.id ? null : agent.id
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-100">
                            {agent.name}
                          </span>
                          <span className="text-cyan-400 font-semibold">
                            {agent.confidence}%
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">
                          {agent.opinion}
                        </div>
                      </button>

                      {expandedAgent === agent.id && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                          <div>
                            <div className="text-xs text-slate-400 mb-1">
                              Reasoning
                            </div>
                            <div className="text-sm text-slate-300">
                              {agent.reasoning}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">
                              Recommendation
                            </div>
                            <div className="text-sm text-cyan-400">
                              {agent.recommendation}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500"
                                style={{ width: `${agent.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-400">
                              Confidence
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {!currentDebate && (
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a debate to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Debate History */}
      <Card className="bg-slate-900/50 border-cyan-500/30">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Debates
          </h3>
          <div className="space-y-3">
            {[
              {
                case: "Sepsis management protocol",
                time: "2 hours ago",
                result: "Consensus reached",
              },
              {
                case: "Antibiotic selection",
                time: "4 hours ago",
                result: "Consensus reached",
              },
              {
                case: "Surgical timing decision",
                time: "6 hours ago",
                result: "Partial agreement",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div>
                  <div className="font-semibold text-slate-100">{item.case}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">{item.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
