import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * MedOS Module Agent
 * Medical Operating System - manages clinical workflows and protocols
 */
export default function MedOSModuleAgent() {
  const [selectedWorkflow, setSelectedWorkflow] = useState("triage");

  const workflows = [
    {
      id: "triage",
      name: "Triage Protocol",
      status: "active",
      steps: 5,
      completion: 80,
    },
    {
      id: "discharge",
      name: "Discharge Planning",
      status: "active",
      steps: 8,
      completion: 60,
    },
    {
      id: "medication",
      name: "Medication Management",
      status: "active",
      steps: 6,
      completion: 95,
    },
    {
      id: "infection",
      name: "Infection Control",
      status: "paused",
      steps: 4,
      completion: 50,
    },
  ];

  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflow);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 font-mono">MedOS Module</h1>
          <p className="text-slate-400 mt-2">
            Medical Operating System - Clinical workflows and protocols
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">System Status</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-400">Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-cyan-500/30">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Workflows</h2>
            <div className="space-y-2">
              {workflows.map((workflow) => (
                <button
                  key={workflow.id}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedWorkflow === workflow.id
                      ? "bg-cyan-600/20 border-l-2 border-cyan-500"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="font-semibold text-slate-100">{workflow.name}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        workflow.status === "active" ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="text-xs text-slate-400">{workflow.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {workflow.steps} steps
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Workflow Details */}
        {currentWorkflow && (
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                  {currentWorkflow.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">Completion</span>
                      <span className="text-cyan-400 font-semibold">
                        {currentWorkflow.completion}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        style={{ width: `${currentWorkflow.completion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400">Total Steps</div>
                      <div className="text-2xl font-bold text-cyan-400 mt-1">
                        {currentWorkflow.steps}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400">Completed</div>
                      <div className="text-2xl font-bold text-green-400 mt-1">
                        {Math.round((currentWorkflow.completion / 100) * currentWorkflow.steps)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Steps */}
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Workflow Steps
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        step <= Math.round((currentWorkflow.completion / 100) * currentWorkflow.steps)
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-slate-800/50 border border-slate-700/30"
                      }`}
                    >
                      {step <= Math.round((currentWorkflow.completion / 100) * currentWorkflow.steps) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-slate-400">{step}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-slate-100">
                          Step {step}: {["Assessment", "Planning", "Execution", "Monitoring", "Completion"][step - 1]}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {["Initial patient evaluation", "Create care plan", "Implement protocol", "Track progress", "Document outcomes"][step - 1]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* System Modules */}
      <Card className="bg-slate-900/50 border-cyan-500/30">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5" />
            System Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Pharmacy", status: "online", alerts: 0 },
              { name: "Lab", status: "online", alerts: 2 },
              { name: "Imaging", status: "online", alerts: 0 },
              { name: "Records", status: "online", alerts: 1 },
            ].map((module) => (
              <div
                key={module.name}
                className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-100">{module.name}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      module.status === "online" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                </div>
                <div className="text-xs text-slate-400">
                  {module.status === "online" ? "Online" : "Offline"}
                </div>
                {module.alerts > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-400">
                    <AlertTriangle className="w-3 h-3" />
                    {module.alerts} alert{module.alerts > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-cyan-500/30">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              Start Workflow
            </Button>
            <Button variant="outline">Pause Workflow</Button>
            <Button variant="outline">View Reports</Button>
            <Button variant="outline">System Settings</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
