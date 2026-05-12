import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, CheckCircle2, WifiOff, Maximize2, Minimize2 } from "lucide-react";

type SyncStatus = "idle" | "loading" | "synced" | "error" | "offline";

interface HtmlAgentRendererProps {
  htmlUrl: string;
  agentName: string;
  agentDescription?: string;
  category?: string;
}

const FETCH_TIMEOUT_MS = 15000;

/**
 * Renders HTML pages from health-ai repository as sandboxed agents
 * Uses iframe for security and isolation, with retry and sync status
 */
export function HtmlAgentRenderer({
  htmlUrl,
  agentName,
  agentDescription,
  category,
}: HtmlAgentRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadHtml = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSyncStatus("loading");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(htmlUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const htmlContent = await response.text();

      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();
        }
      }

      setSyncStatus("synced");
      setLastSynced(new Date());
      setIsLoading(false);
    } catch (err) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const message = isAbort
        ? `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s`
        : err instanceof Error
        ? err.message
        : String(err);

      const isOffline = !navigator.onLine || message.toLowerCase().includes("network");
      setSyncStatus(isOffline ? "offline" : "error");
      setError(message);
      setIsLoading(false);
    }
  }, [htmlUrl]);

  useEffect(() => {
    loadHtml();
  }, [loadHtml]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    loadHtml();
  };

  const statusColors: Record<SyncStatus, string> = {
    idle: "text-slate-400",
    loading: "text-yellow-400",
    synced: "text-green-400",
    error: "text-red-400",
    offline: "text-orange-400",
  };

  const StatusIcon = () => {
    if (syncStatus === "loading") return <Loader2 className="w-3 h-3 animate-spin" />;
    if (syncStatus === "synced") return <CheckCircle2 className="w-3 h-3" />;
    if (syncStatus === "offline") return <WifiOff className="w-3 h-3" />;
    if (syncStatus === "error") return <AlertCircle className="w-3 h-3" />;
    return null;
  };

  const iframeHeight = isExpanded ? "h-[80vh]" : "h-[520px]";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-cyan-400 font-mono truncate">
            {agentName}
          </h2>
          {agentDescription && (
            <p className="text-slate-400 mt-1 text-sm">{agentDescription}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {category && (
              <span className="text-xs px-2 py-0.5 bg-cyan-600/20 text-cyan-400 rounded border border-cyan-500/20">
                {category}
              </span>
            )}
            <span className={`flex items-center gap-1 text-xs ${statusColors[syncStatus]}`}>
              <StatusIcon />
              {syncStatus === "synced" && lastSynced
                ? `Synced ${lastSynced.toLocaleTimeString()}`
                : syncStatus === "loading"
                ? "Fetching from GitHub..."
                : syncStatus === "offline"
                ? "Offline — cached version"
                : syncStatus === "error"
                ? "Sync failed"
                : "Ready"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(syncStatus === "error" || syncStatus === "offline") && (
            <Button onClick={handleRetry} variant="outline" size="sm" className="text-cyan-400 border-cyan-500/30 hover:border-cyan-400">
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry {retryCount > 0 ? `(${retryCount})` : ""}
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded((e) => !e)}
            variant="outline"
            size="sm"
            className="text-slate-400 border-slate-700 hover:border-cyan-500/50"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Iframe Card */}
      <Card className="bg-slate-900/50 border-cyan-500/30 overflow-hidden">
        {isLoading && (
          <div className={`${iframeHeight} flex items-center justify-center bg-slate-900/80`}>
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
              <p className="text-slate-300 font-mono text-sm">Loading {agentName}</p>
              <p className="text-slate-500 text-xs mt-1">Fetching from GitHub…</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className={`${iframeHeight} flex items-center justify-center bg-slate-900/80`}>
            <div className="text-center max-w-sm space-y-3 px-6">
              {syncStatus === "offline" ? (
                <WifiOff className="w-10 h-10 text-orange-400 mx-auto" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              )}
              <p className="text-red-300 font-semibold font-mono text-sm">
                {syncStatus === "offline" ? "Network unavailable" : "Agent failed to load"}
              </p>
              <p className="text-slate-400 text-xs font-mono break-all">{error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm" className="mt-2 border-cyan-500/30 text-cyan-400">
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <iframe
            ref={iframeRef}
            className={`w-full ${iframeHeight} border-0 transition-all duration-300`}
            title={agentName}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
          />
        )}
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
        <span className="truncate max-w-xs">{htmlUrl}</span>
        {retryCount > 0 && <span>{retryCount} retry attempt{retryCount !== 1 ? "s" : ""}</span>}
      </div>
    </div>
  );
}

/**
 * Agent list view showing all available agents in a grid
 */
export function AgentListView({
  agents,
  onSelectAgent,
}: {
  agents: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    htmlUrl: string;
    status?: "active" | "inactive" | "testing";
  }>;
  onSelectAgent: (agent: (typeof agents)[0]) => void;
}) {
  const statusColor: Record<string, string> = {
    active: "bg-green-400",
    inactive: "bg-slate-500",
    testing: "bg-yellow-400",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <Card
          key={agent.id}
          onClick={() => onSelectAgent(agent)}
          className="bg-slate-900/50 border-cyan-500/30 cursor-pointer hover:border-cyan-500 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all p-4 group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors font-mono text-sm">
              {agent.name}
            </div>
            {agent.status && (
              <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${statusColor[agent.status] ?? "bg-slate-500"}`} />
            )}
          </div>
          <div className="text-xs text-slate-400 mb-3 line-clamp-2">{agent.description}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 bg-cyan-600/20 text-cyan-400 rounded border border-cyan-500/20">
              {agent.category}
            </span>
            <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">Launch →</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Grouped agent view by category
 */
export function GroupedAgentView({
  grouped,
  onSelectAgent,
}: {
  grouped: Record<
    string,
    Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      htmlUrl: string;
      status?: "active" | "inactive" | "testing";
    }>
  >;
  onSelectAgent: (agent: any) => void;
}) {
  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, agents]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center gap-2 font-mono uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            {category}
            <span className="text-xs text-slate-500 ml-auto normal-case tracking-normal">
              {agents.length} module{agents.length !== 1 ? "s" : ""}
            </span>
          </h3>
          <AgentListView agents={agents as any} onSelectAgent={onSelectAgent} />
        </div>
      ))}
    </div>
  );
}
