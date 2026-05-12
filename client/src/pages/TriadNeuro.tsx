import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import {
  Brain, Zap, Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw,
  Scan, FlaskConical, Target, Cpu, Wifi, WifiOff, BarChart3, Eye,
  TrendingUp, TrendingDown, Minus, Radio, Network, Shield, Layers,
  ChevronDown, ChevronRight, Play, Pause, Settings, Download,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
type OncoSubModule = "imaging" | "pipeline" | "treatment";
type NeuroTab = "eeg" | "oncoai" | "neurosync";

interface NeuroAgent {
  agentId: string;
  agentName: string;
  agentType: string;
  connectionStatus: "connected" | "syncing" | "idle" | "error";
  confidenceScore: number;
  alphaWave: number;
  betaWave: number;
  thetaWave: number;
  deltaWave: number;
}

// ─── Static demo data ─────────────────────────────────────────────────────────
const DEMO_AGENTS: NeuroAgent[] = [
  { agentId: "eeg-001", agentName: "EEG Analyzer Pro", agentType: "eeg_analyzer", connectionStatus: "connected", confidenceScore: 94, alphaWave: 82, betaWave: 67, thetaWave: 45, deltaWave: 23 },
  { agentId: "mri-001", agentName: "MRI Processor v2", agentType: "mri_processor", connectionStatus: "syncing", confidenceScore: 88, alphaWave: 78, betaWave: 71, thetaWave: 52, deltaWave: 31 },
  { agentId: "sz-001", agentName: "Seizure Predictor", agentType: "seizure_predictor", connectionStatus: "connected", confidenceScore: 91, alphaWave: 75, betaWave: 63, thetaWave: 48, deltaWave: 19 },
  { agentId: "st-001", agentName: "Stroke Detector AI", agentType: "stroke_detector", connectionStatus: "connected", confidenceScore: 89, alphaWave: 80, betaWave: 69, thetaWave: 41, deltaWave: 27 },
  { agentId: "cog-001", agentName: "Cognitive Assessor", agentType: "cognitive_assessor", connectionStatus: "idle", confidenceScore: 85, alphaWave: 72, betaWave: 58, thetaWave: 55, deltaWave: 35 },
  { agentId: "tx-001", agentName: "Treatment Optimizer", agentType: "treatment_optimizer", connectionStatus: "connected", confidenceScore: 92, alphaWave: 84, betaWave: 74, thetaWave: 43, deltaWave: 22 },
  { agentId: "di-001", agentName: "Drug Interaction Engine", agentType: "drug_interaction", connectionStatus: "connected", confidenceScore: 96, alphaWave: 88, betaWave: 77, thetaWave: 39, deltaWave: 18 },
  { agentId: "nm-001", agentName: "Neuro Monitor 360", agentType: "neuro_monitor", connectionStatus: "syncing", confidenceScore: 87, alphaWave: 76, betaWave: 65, thetaWave: 50, deltaWave: 29 },
];

// ─── Connection Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: NeuroAgent["connectionStatus"] }) {
  const config = {
    connected: { color: "text-green-300 bg-green-500/20 border-green-500/30", dot: "bg-green-400", label: "Connected" },
    syncing: { color: "text-blue-300 bg-blue-500/20 border-blue-500/30", dot: "bg-blue-400 animate-pulse", label: "Syncing" },
    idle: { color: "text-slate-300 bg-slate-500/20 border-slate-500/30", dot: "bg-slate-400", label: "Idle" },
    error: { color: "text-red-300 bg-red-500/20 border-red-500/30", dot: "bg-red-400", label: "Error" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ─── Wave Bar ─────────────────────────────────────────────────────────────────
function WaveBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-10 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-300 w-8 text-right">{value}%</span>
    </div>
  );
}

// ─── Neuro-Sync Agent Card ────────────────────────────────────────────────────
function NeuroAgentCard({ agent }: { agent: NeuroAgent }) {
  const [expanded, setExpanded] = useState(false);
  const typeIconMap: Record<string, React.ElementType> = {
    eeg_analyzer: Activity, mri_processor: Scan, seizure_predictor: Zap,
    stroke_detector: AlertTriangle, cognitive_assessor: Brain,
    treatment_optimizer: Target, drug_interaction: FlaskConical, neuro_monitor: Radio,
  };
  const AgentIcon = typeIconMap[agent.agentType] ?? Cpu;

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden">
      <div
        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-1.5 rounded bg-purple-500/20 border border-purple-500/30">
          <AgentIcon className="h-4 w-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{agent.agentName}</p>
          <p className="text-xs text-slate-500">{agent.agentType.replace(/_/g, " ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={agent.connectionStatus} />
          <span className="text-xs text-cyan-300 font-semibold">{agent.confidenceScore}%</span>
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-700/30 pt-3 space-y-2">
          <WaveBar label="Alpha" value={agent.alphaWave} color="bg-cyan-500" />
          <WaveBar label="Beta" value={agent.betaWave} color="bg-blue-500" />
          <WaveBar label="Theta" value={agent.thetaWave} color="bg-purple-500" />
          <WaveBar label="Delta" value={agent.deltaWave} color="bg-pink-500" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Confidence Score</span>
            <div className="flex items-center gap-2">
              <Progress value={agent.confidenceScore} className="w-20 h-1.5 bg-slate-700" />
              <span className="text-xs text-cyan-300 font-bold">{agent.confidenceScore}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EEG Analysis Panel ───────────────────────────────────────────────────────
function EEGPanel() {
  const [isRunning, setIsRunning] = useState(true);
  const waves = [
    { name: "Alpha Waves (8–13 Hz)", value: 82, color: "bg-cyan-500", desc: "Relaxed alertness" },
    { name: "Beta Waves (13–30 Hz)", value: 67, color: "bg-blue-500", desc: "Active thinking" },
    { name: "Theta Waves (4–8 Hz)", value: 45, color: "bg-purple-500", desc: "Drowsiness / creativity" },
    { name: "Delta Waves (0.5–4 Hz)", value: 23, color: "bg-pink-500", desc: "Deep sleep" },
    { name: "Gamma Waves (30–100 Hz)", value: 38, color: "bg-green-500", desc: "Cognitive processing" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
          <Activity className="h-5 w-5" /> EEG Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded border ${isRunning ? "text-green-300 bg-green-500/20 border-green-500/30" : "text-slate-300 bg-slate-500/20 border-slate-500/30"}`}>
            {isRunning ? "● LIVE" : "○ PAUSED"}
          </span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {waves.map((wave) => (
          <div key={wave.name} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm text-slate-200 font-medium">{wave.name}</span>
                <p className="text-xs text-slate-500">{wave.desc}</p>
              </div>
              <span className="text-cyan-300 font-bold text-sm">{wave.value}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div className={`h-2 rounded-full ${wave.color} transition-all duration-1000`} style={{ width: `${wave.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Neurological Status */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">Neurological Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Consciousness", value: "Alert", color: "text-green-300", icon: CheckCircle2 },
            { label: "Seizure Risk", value: "Low (12%)", color: "text-green-300", icon: Zap },
            { label: "Cognitive Function", value: "Normal", color: "text-green-300", icon: Brain },
            { label: "Motor Response", value: "Normal", color: "text-green-300", icon: Activity },
            { label: "Stroke Probability", value: "8%", color: "text-green-300", icon: AlertTriangle },
            { label: "ICP Status", value: "Normal", color: "text-green-300", icon: Shield },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-1.5">
                  <ItemIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
                <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── OncoAI PWA v3 ────────────────────────────────────────────────────────────
function OncoAIPWAv3() {
  const [activeSubModule, setActiveSubModule] = useState<OncoSubModule>("imaging");
  const [isProcessing, setIsProcessing] = useState(false);

  const subModules: { id: OncoSubModule; label: string; icon: React.ElementType; color: string }[] = [
    { id: "imaging", label: "Imaging", icon: Scan, color: "text-pink-400" },
    { id: "pipeline", label: "Pipeline", icon: FlaskConical, color: "text-purple-400" },
    { id: "treatment", label: "Treatment", icon: Target, color: "text-cyan-400" },
  ];

  const runAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-pink-300 flex items-center gap-2">
            <Zap className="h-5 w-5" /> OncoAI PWA v3
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Oncology AI — Triad Neuro Integration</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded">v3.0</span>
          <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded">● Online</span>
        </div>
      </div>

      {/* Sub-module tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/60 rounded-lg border border-slate-700/50">
        {subModules.map((sub) => {
          const SubIcon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubModule(sub.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-medium transition-all ${
                activeSubModule === sub.id
                  ? "bg-slate-700 text-slate-100 shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
              }`}
            >
              <SubIcon className={`h-3.5 w-3.5 ${activeSubModule === sub.id ? sub.color : ""}`} />
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Imaging Sub-Module */}
      {activeSubModule === "imaging" && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-pink-500/30 bg-pink-500/5">
            <h4 className="text-sm font-bold text-pink-300 mb-3 flex items-center gap-2">
              <Scan className="h-4 w-4" /> Imaging Analysis Module
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Modality", value: "MRI — 3T FLAIR" },
                { label: "Patient ID", value: "PT-2024-0847" },
                { label: "Scan Date", value: "2024-05-12" },
                { label: "Body Region", value: "Brain — Axial" },
              ].map((item) => (
                <div key={item.label} className="p-2 bg-slate-800/50 rounded border border-slate-700/40">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/40">
                <span className="text-xs text-slate-400">Tumor Detected</span>
                <span className="text-xs font-bold text-orange-300">YES — Left Temporal</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/40">
                <span className="text-xs text-slate-400">Tumor Size</span>
                <span className="text-xs font-bold text-slate-200">2.3 × 1.8 × 2.1 cm</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/40">
                <span className="text-xs text-slate-400">AI Confidence</span>
                <div className="flex items-center gap-2">
                  <Progress value={87} className="w-16 h-1.5 bg-slate-700" />
                  <span className="text-xs font-bold text-cyan-300">87%</span>
                </div>
              </div>
            </div>
            {/* Risk Indicators */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Seizure Risk", value: 34, color: "text-orange-300", bg: "bg-orange-500" },
                { label: "Stroke Prob.", value: 12, color: "text-green-300", bg: "bg-green-500" },
                { label: "Cognitive", value: 65, color: "text-yellow-300", bg: "bg-yellow-500" },
              ].map((risk) => (
                <div key={risk.label} className="p-2 bg-slate-800/50 rounded border border-slate-700/40 text-center">
                  <p className="text-xs text-slate-500 mb-1">{risk.label}</p>
                  <p className={`text-lg font-bold ${risk.color}`}>{risk.value}%</p>
                  <div className="w-full bg-slate-700/50 rounded-full h-1 mt-1">
                    <div className={`h-1 rounded-full ${risk.bg}`} style={{ width: `${risk.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={isProcessing}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white text-xs"
          >
            {isProcessing ? (
              <><RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Processing Imaging Analysis...</>
            ) : (
              <><Scan className="h-3.5 w-3.5 mr-2" /> Run AI Imaging Analysis</>
            )}
          </Button>
        </div>
      )}

      {/* Pipeline Sub-Module */}
      {activeSubModule === "pipeline" && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
            <h4 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Oncology Pipeline
            </h4>
            {/* Pipeline stages */}
            <div className="space-y-2">
              {[
                { stage: "Sample Collection", status: "complete", color: "bg-green-500" },
                { stage: "Genomic Sequencing", status: "complete", color: "bg-green-500" },
                { stage: "Biomarker Analysis", status: "active", color: "bg-blue-500 animate-pulse" },
                { stage: "Pathway Mapping", status: "pending", color: "bg-slate-600" },
                { stage: "Treatment Matching", status: "pending", color: "bg-slate-600" },
                { stage: "Report Generation", status: "pending", color: "bg-slate-600" },
              ].map((step, i) => (
                <div key={step.stage} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${step.color}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-xs ${step.status === "pending" ? "text-slate-500" : "text-slate-200"}`}>
                      {i + 1}. {step.stage}
                    </span>
                    <span className={`text-xs ${
                      step.status === "complete" ? "text-green-300" :
                      step.status === "active" ? "text-blue-300" : "text-slate-500"
                    }`}>
                      {step.status === "complete" ? "✓ Done" : step.status === "active" ? "Running..." : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: "Stage", value: "Stage III-A" },
                { label: "EGFR Status", value: "Positive" },
                { label: "PD-L1 Expression", value: "45%" },
                { label: "TMB Score", value: "High (18.2)" },
              ].map((item) => (
                <div key={item.label} className="p-2 bg-slate-800/50 rounded border border-slate-700/40">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-xs font-bold text-purple-300 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs"
          >
            {isProcessing ? (
              <><RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Running Pipeline...</>
            ) : (
              <><FlaskConical className="h-3.5 w-3.5 mr-2" /> Execute Oncology Pipeline</>
            )}
          </Button>
        </div>
      )}

      {/* Treatment Sub-Module */}
      {activeSubModule === "treatment" && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
            <h4 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" /> Treatment Planning
            </h4>
            <div className="space-y-2">
              {[
                { label: "Recommended Protocol", value: "FOLFOX + Bevacizumab", highlight: true },
                { label: "Radiation Dose", value: "45 Gy in 25 fractions" },
                { label: "Chemotherapy", value: "Oxaliplatin 85 mg/m²" },
                { label: "Immunotherapy", value: "Pembrolizumab 200mg Q3W" },
                { label: "Surgery", value: "Resection — Feasible" },
                { label: "Treatment Response", value: "Partial Response (PR)" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center justify-between p-2.5 rounded border ${
                  item.highlight ? "border-cyan-500/40 bg-cyan-500/10" : "border-slate-700/40 bg-slate-800/50"
                }`}>
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.highlight ? "text-cyan-300" : "text-slate-200"}`}>{item.value}</span>
                </div>
              ))}
            </div>
            {/* Response indicators */}
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-2">Treatment Response Indicators</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Tumor Reduction", value: 42, color: "bg-green-500", text: "text-green-300" },
                  { label: "Quality of Life", value: 78, color: "bg-blue-500", text: "text-blue-300" },
                  { label: "Toxicity Risk", value: 28, color: "bg-orange-500", text: "text-orange-300" },
                  { label: "5-Year Survival", value: 65, color: "bg-cyan-500", text: "text-cyan-300" },
                ].map((ind) => (
                  <div key={ind.label} className="p-2 bg-slate-800/50 rounded border border-slate-700/40">
                    <p className="text-xs text-slate-500">{ind.label}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${ind.color}`} style={{ width: `${ind.value}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${ind.text}`}>{ind.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runAnalysis}
              disabled={isProcessing}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
            >
              {isProcessing ? (
                <><RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Optimizing...</>
              ) : (
                <><Target className="h-3.5 w-3.5 mr-2" /> Optimize Treatment Plan</>
              )}
            </Button>
            <Button variant="outline" size="sm" className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Neuro-Sync Intelligence Panel ───────────────────────────────────────────
function NeuroSyncPanel() {
  const [syncRunning, setSyncRunning] = useState(true);
  const [agents] = useState<NeuroAgent[]>(DEMO_AGENTS);

  const connected = agents.filter((a) => a.connectionStatus === "connected").length;
  const syncing = agents.filter((a) => a.connectionStatus === "syncing").length;
  const idle = agents.filter((a) => a.connectionStatus === "idle").length;
  const avgConfidence = Math.round(agents.reduce((s, a) => s + a.confidenceScore, 0) / agents.length);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
            <Network className="h-5 w-5" /> Neuro-Sync Intelligence
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Multi-agent neural synchronization network</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-purple-300 hover:bg-purple-500/10"
          onClick={() => setSyncRunning(!syncRunning)}
        >
          {syncRunning ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
          {syncRunning ? "Pause" : "Resume"}
        </Button>
      </div>

      {/* Network summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Connected", value: connected, color: "text-green-300", bg: "bg-green-500/10 border-green-500/30" },
          { label: "Syncing", value: syncing, color: "text-blue-300", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Idle", value: idle, color: "text-slate-300", bg: "bg-slate-500/10 border-slate-500/30" },
          { label: "Avg. Conf.", value: `${avgConfidence}%`, color: "text-cyan-300", bg: "bg-cyan-500/10 border-cyan-500/30" },
        ].map((stat) => (
          <div key={stat.label} className={`p-2 rounded-lg border text-center ${stat.bg}`}>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Network topology visual */}
      <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-300">Agent Network Topology</p>
          <span className={`text-xs px-2 py-0.5 rounded border ${syncRunning ? "text-green-300 bg-green-500/20 border-green-500/30" : "text-slate-300 bg-slate-500/20 border-slate-500/30"}`}>
            {syncRunning ? "● SYNC ACTIVE" : "○ PAUSED"}
          </span>
        </div>
        {/* Visual topology */}
        <div className="relative h-32 flex items-center justify-center">
          {/* Central hub */}
          <div className="absolute w-10 h-10 rounded-full bg-purple-500/30 border-2 border-purple-500/60 flex items-center justify-center z-10">
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          {/* Agent nodes */}
          {agents.map((agent, i) => {
            const angle = (i / agents.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 52;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            const colorMap: Record<string, string> = {
              connected: "bg-green-500/40 border-green-500/60",
              syncing: "bg-blue-500/40 border-blue-500/60",
              idle: "bg-slate-500/40 border-slate-500/60",
              error: "bg-red-500/40 border-red-500/60",
            };
            return (
              <div
                key={agent.agentId}
                className={`absolute w-6 h-6 rounded-full border flex items-center justify-center ${colorMap[agent.connectionStatus]}`}
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                title={agent.agentName}
              >
                <span className="text-[8px] text-white font-bold">{i + 1}</span>
              </div>
            );
          })}
          {/* Connection lines (SVG overlay) */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            {agents.map((agent, i) => {
              const angle = (i / agents.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 52;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              const strokeColor = agent.connectionStatus === "connected" ? "#22c55e" : agent.connectionStatus === "syncing" ? "#3b82f6" : "#475569";
              return (
                <line
                  key={agent.agentId}
                  x1="50%" y1="50%"
                  x2={`${x}%`} y2={`${y}%`}
                  stroke={strokeColor}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray={agent.connectionStatus === "syncing" ? "3,3" : "none"}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          {[
            { color: "bg-green-500", label: "Connected" },
            { color: "bg-blue-500", label: "Syncing" },
            { color: "bg-slate-500", label: "Idle" },
          ].map((leg) => (
            <div key={leg.label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${leg.color}`} />
              <span className="text-xs text-slate-400">{leg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent list */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Connected Agents ({agents.length})
        </p>
        <div className="space-y-2">
          {agents.map((agent) => (
            <NeuroAgentCard key={agent.agentId} agent={agent} />
          ))}
        </div>
      </div>

      {/* Aggregated risk scores */}
      <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
        <p className="text-xs font-semibold text-slate-300 mb-3">Aggregated Risk Indicators</p>
        <div className="space-y-3">
          {[
            { label: "Seizure Risk", value: 22, threshold: 30, icon: Zap, color: "bg-orange-500", text: "text-orange-300" },
            { label: "Stroke Probability", value: 8, threshold: 20, icon: AlertTriangle, color: "bg-green-500", text: "text-green-300" },
            { label: "Cognitive Status", value: 78, threshold: 60, icon: Brain, color: "bg-blue-500", text: "text-blue-300", invert: true },
            { label: "ICP Pressure", value: 14, threshold: 20, icon: Activity, color: "bg-green-500", text: "text-green-300" },
          ].map((risk) => {
            const RiskIcon = risk.icon;
            const isAlert = risk.invert ? risk.value < risk.threshold : risk.value > risk.threshold;
            return (
              <div key={risk.label} className="flex items-center gap-3">
                <RiskIcon className={`h-4 w-4 ${isAlert ? "text-red-400" : "text-slate-400"} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{risk.label}</span>
                    <span className={`font-bold ${risk.text}`}>{risk.value}{risk.invert ? "%" : "%"}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${risk.color}`} style={{ width: `${risk.value}%` }} />
                  </div>
                </div>
                {isAlert && <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Triad Neuro Page ────────────────────────────────────────────────────
export default function TriadNeuro() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NeuroTab>("eeg");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Triad Neuro</h1>
          <p className="text-slate-300 mb-6">Please sign in to access neurological analysis</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-cyan-600 hover:bg-cyan-500">
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-glow-cyan">Triad Neuro</h1>
              <p className="text-slate-400 text-sm">EEG Analysis · OncoAI PWA v3 · Neuro-Sync Intelligence</p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> 8 Agents Active
            </span>
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded">
              OncoAI v3 Online
            </span>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded">
              Neuro-Sync Active
            </span>
            <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded">
              EEG Stream Live
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-6 w-fit">
          {[
            { id: "eeg" as const, label: "EEG Analysis", icon: Activity, color: "text-cyan-400" },
            { id: "oncoai" as const, label: "OncoAI PWA v3", icon: Zap, color: "text-pink-400" },
            { id: "neurosync" as const, label: "Neuro-Sync", icon: Network, color: "text-purple-400" },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-700 text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                <TabIcon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main panel */}
          <div className="xl:col-span-2">
            <div className="cosmic-panel">
              {activeTab === "eeg" && <EEGPanel />}
              {activeTab === "oncoai" && <OncoAIPWAv3 />}
              {activeTab === "neurosync" && <NeuroSyncPanel />}
            </div>
          </div>

          {/* Side panel — always shows a summary */}
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="cosmic-panel">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" /> System Overview
              </h3>
              <div className="space-y-2">
                {[
                  { label: "EEG Channels", value: "19 Active", color: "text-cyan-300" },
                  { label: "OncoAI Sessions", value: "3 Today", color: "text-pink-300" },
                  { label: "Sync Agents", value: "8 / 8", color: "text-purple-300" },
                  { label: "Risk Alerts", value: "0 Critical", color: "text-green-300" },
                  { label: "Data Points", value: "142,847", color: "text-blue-300" },
                  { label: "Uptime", value: "99.8%", color: "text-green-300" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 bg-slate-800/40 rounded border border-slate-700/40">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active tab quick-switch panel */}
            {activeTab !== "neurosync" && (
              <div className="cosmic-panel">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4 text-purple-400" /> Agent Summary
                </h3>
                <div className="space-y-1.5">
                  {DEMO_AGENTS.slice(0, 4).map((agent) => (
                    <div key={agent.agentId} className="flex items-center justify-between p-2 bg-slate-800/40 rounded border border-slate-700/40">
                      <span className="text-xs text-slate-300 truncate">{agent.agentName}</span>
                      <StatusBadge status={agent.connectionStatus} />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-slate-400 hover:text-slate-200 mt-1"
                    onClick={() => setActiveTab("neurosync")}
                  >
                    View all 8 agents →
                  </Button>
                </div>
              </div>
            )}

            {/* OncoAI quick access */}
            {activeTab !== "oncoai" && (
              <div className="cosmic-panel">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pink-400" /> OncoAI PWA v3
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Imaging", status: "Ready", color: "text-green-300" },
                    { label: "Pipeline", status: "Running", color: "text-blue-300" },
                    { label: "Treatment", status: "Ready", color: "text-green-300" },
                  ].map((sub) => (
                    <div key={sub.label} className="flex items-center justify-between p-2 bg-slate-800/40 rounded border border-slate-700/40">
                      <span className="text-xs text-slate-300">{sub.label}</span>
                      <span className={`text-xs font-semibold ${sub.color}`}>{sub.status}</span>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 mt-1"
                    onClick={() => setActiveTab("oncoai")}
                  >
                    Open OncoAI PWA v3 →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
