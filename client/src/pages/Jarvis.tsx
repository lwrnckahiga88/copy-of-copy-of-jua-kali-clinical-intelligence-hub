import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Loader2, GitBranch, CheckCircle2, AlertCircle, RefreshCw,
  Terminal, Zap, Shield, Database, Activity, Package, Play,
  Wifi, WifiOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { JarvisCommandInterface } from "@/components/JarvisCommandInterface";
import { useLocation } from "wouter";

/**
 * Jarvis Panel — Intent Routing Engine + Apify Orchestration
 */
export default function Jarvis() {
  const [, setLocation] = useLocation();
  const [syncRunning, setSyncRunning] = useState(false);

  // Queries
  const tokenQuery = trpc.jarvis.verifyToken.useQuery(undefined, { refetchInterval: 0 });
  const statusQuery = trpc.jarvis.statusCheck.useQuery();
  const actorsQuery = trpc.jarvis.listActors.useQuery();
  const agentsQuery = trpc.healthAiAgents.fetchAll.useQuery();

  // Mutations
  const runSync = trpc.jarvis.runHealthAiSync.useMutation({
    onSuccess: (data) => {
      setSyncRunning(false);
      if (data.success) {
        toast.success(`Synced ${(data as any).filesFound} files from health-ai`);
        agentsQuery.refetch();
      } else {
        toast.error((data as any).error ?? "Sync failed");
      }
    },
    onError: (err) => {
      setSyncRunning(false);
      toast.error(err.message);
    },
  });

  const handleSync = () => {
    setSyncRunning(true);
    runSync.mutate();
  };

  const handleNavigate = (agentId: string) => {
    const routes: Record<string, string> = {
      nurseai: "/nurse-ai", analytics: "/analytics",
      "triad-neuro": "/triad-neuro", "cerberus-bpu": "/cerberus-bpu",
      "medos-module": "/medos-module", "intervention-planner": "/intervention-planner",
      "agent-debate": "/agent-debate", jarvis: "/jarvis",
      "nexus-dashboard": "/nexus-dashboard",
    };
    const r = routes[agentId];
    if (r) setLocation(r);
  };

  const token = tokenQuery.data;
  const status = statusQuery.data?.data as Record<string, string> | undefined;
  const actors = (actorsQuery.data?.actors ?? []) as Array<{ id: string; name: string; stats?: { totalRuns?: number } }>;
  const agents = agentsQuery.data?.agents ?? [];

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 font-mono flex items-center gap-2">
            <Terminal className="w-7 h-7" />
            Jarvis
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Intent routing engine · Apify orchestration · GitHub sync
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncRunning}
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
          size="sm"
        >
          {syncRunning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Sync health-ai
        </Button>
      </div>

      {/* LLM Command Interface */}
      <JarvisCommandInterface onNavigateToAgent={handleNavigate} />

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Token Status */}
        <Card className="bg-slate-900/50 border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Apify Token</span>
          </div>
          {tokenQuery.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : token?.valid ? (
            <>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-mono text-sm font-bold">Valid</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{token.username} · {token.plan}</div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-mono text-sm">Invalid</span>
            </div>
          )}
        </Card>

        {/* GitHub Status */}
        <Card className="bg-slate-900/50 border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">GitHub</span>
          </div>
          {status ? (
            <div className="flex items-center gap-1">
              {status.github === 'connected' ? (
                <><Wifi className="w-4 h-4 text-green-400" /><span className="text-green-400 font-mono text-sm font-bold">Connected</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-orange-400" /><span className="text-orange-400 font-mono text-sm">Not configured</span></>
              )}
            </div>
          ) : <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
        </Card>

        {/* Agents */}
        <Card className="bg-slate-900/50 border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Agents</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {agentsQuery.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : agents.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">health-ai modules</div>
        </Card>

        {/* StudioOS */}
        <Card className="bg-slate-900/50 border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">StudioOS</span>
          </div>
          {status ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono text-sm font-bold capitalize">{status.studioOS}</span>
            </div>
          ) : <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
        </Card>
      </div>

      {/* Apify Actors */}
      <Card className="bg-slate-900/50 border-cyan-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 font-mono text-base flex items-center gap-2">
            <Package className="w-4 h-4" />
            Apify Actors
            {actorsQuery.isLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
            {!actorsQuery.isLoading && (
              <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-500/30 ml-2">
                {actors.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actorsQuery.isError || !tokenQuery.data?.valid ? (
            <div className="text-sm text-slate-500 font-mono py-4 text-center">
              {!tokenQuery.data?.valid ? "Configure Apify token to see actors" : "Failed to load actors"}
            </div>
          ) : actors.length === 0 && !actorsQuery.isLoading ? (
            <div className="text-sm text-slate-500 font-mono py-4 text-center">No actors found on this account</div>
          ) : (
            <div className="space-y-2">
              {actors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/40 hover:border-cyan-500/30 transition-all"
                >
                  <div>
                    <div className="text-sm text-slate-200 font-mono">{actor.name || actor.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{actor.id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {actor.stats?.totalRuns !== undefined && (
                      <span className="text-xs text-slate-500">{actor.stats.totalRuns} runs</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-400 hover:border-cyan-400 h-7 text-xs"
                      onClick={() => toast.info(`Actor: ${actor.id}`)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Result / Agent List Preview */}
      {agents.length > 0 && (
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400 font-mono text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              health-ai Modules
              <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-500/30 ml-2">
                {agents.length}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-slate-400 hover:text-cyan-400 h-7 text-xs"
                onClick={() => setLocation("/health-ai-agents")}
              >
                View all →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {agents.slice(0, 12).map((agent) => (
                <div
                  key={agent.id}
                  className="p-2 bg-slate-800/40 rounded border border-slate-700/30 hover:border-cyan-500/30 transition-all cursor-pointer group"
                  onClick={() => setLocation("/health-ai-agents")}
                >
                  <div className="text-xs font-mono text-slate-300 group-hover:text-cyan-300 transition-colors truncate">
                    {agent.name}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5 truncate">{agent.category}</div>
                </div>
              ))}
              {agents.length > 12 && (
                <div className="p-2 bg-slate-800/20 rounded border border-dashed border-slate-700/30 flex items-center justify-center">
                  <span className="text-xs text-slate-500">+{agents.length - 12} more</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
