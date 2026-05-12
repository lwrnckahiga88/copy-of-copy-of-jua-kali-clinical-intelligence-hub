import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Grid3x3, List } from "lucide-react";
import {
  HtmlAgentRenderer,
  AgentListView,
  GroupedAgentView,
} from "@/components/HtmlAgentRenderer";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  htmlUrl: string;
  functionality: string[];
  status: "active" | "inactive" | "testing";
}

type ViewMode = "grid" | "grouped" | "detail";

/**
 * Health AI Agents Dashboard
 * Displays all 82+ HTML pages from health-ai repository as interactive agents
 */
export default function HealthAIAgents() {
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all agents
  const allAgentsQuery = trpc.healthAiAgents.fetchAll.useQuery();
  const groupedAgentsQuery = trpc.healthAiAgents.getGrouped.useQuery();

  const agents = allAgentsQuery.data?.agents || [];
  const grouped = groupedAgentsQuery.data?.grouped || {};
  const categories = Object.keys(grouped);

  // Filter agents based on search and category
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLoading = allAgentsQuery.isLoading || groupedAgentsQuery.isLoading;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 font-mono">
            Health AI Agents
          </h1>
          <p className="text-slate-400 mt-2">
            Interactive clinical tools from lwrnckahiga88/health-ai repository
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Total Agents</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {agents.length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-slate-900/50 border-cyan-500/30 p-4">
        <div className="space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Filter by Category</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedCategory(null)}
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                  >
                    {category}
                    <span className="ml-2 text-xs opacity-75">
                      ({((grouped as any)[category] || []).length})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* View Mode */}
          <div className="space-y-2">
            <div className="text-sm text-slate-400">View Mode</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode("grouped")}
                variant={viewMode === "grouped" ? "default" : "outline"}
                size="sm"
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Grouped
              </Button>
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
              >
                <List className="w-4 h-4 mr-2" />
                Grid
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
            <p className="text-slate-400">Loading agents...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && allAgentsQuery.isError && (
        <Card className="bg-red-500/10 border-red-500/30 p-4">
          <p className="text-red-400">
            Failed to load agents. Please try again.
          </p>
        </Card>
      )}

      {/* Detail View */}
      {selectedAgent && viewMode === "detail" && (
        <div className="space-y-4">
          <Button
            onClick={() => setSelectedAgent(null)}
            variant="outline"
            size="sm"
          >
            ← Back to List
          </Button>
          <HtmlAgentRenderer
            htmlUrl={selectedAgent.htmlUrl}
            agentName={selectedAgent.name}
            agentDescription={selectedAgent.description}
            category={selectedAgent.category}
          />
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === "grid" && filteredAgents.length > 0 && (
        <AgentListView
          agents={filteredAgents as any}
          onSelectAgent={(agent: any) => {
            const fullAgent = filteredAgents.find((a) => a.id === agent.id);
            if (fullAgent) {
              setSelectedAgent(fullAgent);
              setViewMode("detail");
            }
          }}
        />
      )}

      {/* Grouped View */}
      {!isLoading && viewMode === "grouped" && Object.keys(grouped).length > 0 && (
        <GroupedAgentView
          grouped={
            selectedCategory && grouped[selectedCategory as keyof typeof grouped]
              ? { [selectedCategory]: grouped[selectedCategory as keyof typeof grouped] as any }
              : (grouped as any)
          }
          onSelectAgent={(agent: any) => {
            const fullAgent = agents.find((a) => a.id === agent.id);
            if (fullAgent) {
              setSelectedAgent(fullAgent);
              setViewMode("detail");
            }
          }}
        />
      )}

      {/* Empty State */}
      {!isLoading && filteredAgents.length === 0 && (
        <Card className="bg-slate-900/50 border-cyan-500/30 p-8 text-center">
          <p className="text-slate-400">No agents found matching your criteria.</p>
        </Card>
      )}

      {/* Statistics */}
      {!isLoading && agents.length > 0 && (
        <Card className="bg-slate-900/50 border-cyan-500/30 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-400">Total Agents</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {agents.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Categories</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {categories.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Active</div>
              <div className="text-2xl font-bold text-green-400 mt-1">
                {agents.filter((a) => a.status === "active").length}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Filtered</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {filteredAgents.length}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
