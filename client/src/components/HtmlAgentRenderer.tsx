import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

interface HtmlAgentRendererProps {
  htmlUrl: string;
  agentName: string;
  agentDescription?: string;
  category?: string;
}

/**
 * Renders HTML pages from health-ai repository as sandboxed agents
 * Uses iframe for security and isolation
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

  useEffect(() => {
    const loadHtml = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the HTML content
        const response = await fetch(htmlUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const htmlContent = await response.text();

        // Write content to iframe
        if (iframeRef.current) {
          const doc = iframeRef.current.contentDocument;
          if (doc) {
            doc.open();
            doc.write(htmlContent);
            doc.close();
          }
        }

        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setIsLoading(false);
      }
    };

    loadHtml();
  }, [htmlUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 font-mono">
            {agentName}
          </h2>
          {agentDescription && (
            <p className="text-slate-400 mt-1">{agentDescription}</p>
          )}
          {category && (
            <div className="text-xs text-slate-500 mt-2 px-2 py-1 bg-slate-800/50 rounded w-fit">
              {category}
            </div>
          )}
        </div>
      </div>

      <Card className="bg-slate-900/50 border-cyan-500/30 overflow-hidden">
        {isLoading && (
          <div className="h-96 flex items-center justify-center bg-slate-800/50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
              <p className="text-slate-400">Loading {agentName}...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="h-96 flex items-center justify-center bg-slate-800/50">
            <div className="text-center max-w-sm">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 font-semibold">Failed to load agent</p>
              <p className="text-slate-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <iframe
            ref={iframeRef}
            className="w-full h-96 border-0"
            title={agentName}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
          />
        )}
      </Card>

      <div className="text-xs text-slate-500">
        <p>Source: {htmlUrl}</p>
      </div>
    </div>
  );
}

/**
 * Agent list view showing all available agents
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
  }>;
  onSelectAgent: (agent: (typeof agents)[0]) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <Card
          key={agent.id}
          onClick={() => onSelectAgent(agent)}
          className="bg-slate-900/50 border-cyan-500/30 cursor-pointer hover:border-cyan-500 transition-all p-4"
        >
          <div className="font-semibold text-slate-100 mb-2">{agent.name}</div>
          <div className="text-sm text-slate-400 mb-3">{agent.description}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded">
              {agent.category}
            </span>
            <span className="text-xs text-slate-500">→</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Grouped agent view
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
    }>
  >;
  onSelectAgent: (agent: any) => void;
}) {
  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, agents]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            {category}
            <span className="text-xs text-slate-400 ml-auto">
              {agents.length} agent{agents.length !== 1 ? "s" : ""}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className="bg-slate-900/50 border-cyan-500/30 cursor-pointer hover:border-cyan-500 transition-all p-4"
              >
                <div className="font-semibold text-slate-100 mb-2">
                  {agent.name}
                </div>
                <div className="text-sm text-slate-400 mb-3">
                  {agent.description}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded">
                    {agent.category}
                  </span>
                  <span className="text-xs text-slate-500">→</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
