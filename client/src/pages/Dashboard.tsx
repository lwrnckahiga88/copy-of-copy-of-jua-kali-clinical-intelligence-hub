import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { pageMapping, getAgentsByCategory, searchAgents, getAllCategories } from "@/lib/pageMapping";
import { LogOut, Search, ChevronDown, Zap, Menu, X, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { MpesaPaymentModal } from "@/components/MpesaPaymentModal";
import { useNurseAISync } from "@/hooks/useNurseAISync";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(getAllCategories())
  );
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);

  // NurseAI sync for cross-agent communication
  const { iframeRef, broadcastNurseAIData, syncIframeWithState } = useNurseAISync(
    selectedAgent || 'dashboard'
  );

  // Get credit balance
  const { data: creditsData = 100 } = trpc.payment.getBalance.useQuery();
  const credits = typeof creditsData === 'number' ? creditsData : creditsData?.balance || 100;

  // Filter agents based on search and category
  const filteredAgents = useMemo(() => {
    let agents = searchQuery ? searchAgents(searchQuery) : pageMapping;
    if (selectedCategory) {
      agents = agents.filter((a) => a.category === selectedCategory);
    }
    return agents;
  }, [searchQuery, selectedCategory]);

  // Group filtered agents by category
  const groupedAgents = useMemo(() => {
    const groups: Record<string, typeof pageMapping> = {};
    filteredAgents.forEach((agent) => {
      if (!groups[agent.category]) {
        groups[agent.category] = [];
      }
      groups[agent.category].push(agent);
    });
    return groups;
  }, [filteredAgents]);

  const selectedAgentData = selectedAgent ? pageMapping.find((a) => a.id === selectedAgent) : null;

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 border-r border-border/50 bg-card overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-bold text-lg">Jua Kali</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credit Balance */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg p-4 border border-accent/30">
            <div className="text-sm text-muted-foreground mb-1">Available Credits</div>
            <div className="text-3xl font-bold text-accent">{credits}</div>
          </div>

          {/* Top Up Button */}
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => setMpesaModalOpen(true)}
          >
            <Zap className="w-4 h-4 mr-2" />
            Top Up with Mpesa
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-border/50"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-border/50 space-y-2 max-h-32 overflow-y-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              selectedCategory === null
                ? "bg-accent/20 text-accent"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            All Categories
          </button>
          {getAllCategories().map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                selectedCategory === category
                  ? "bg-accent/20 text-accent"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(groupedAgents).map(([category, agents]) => (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-semibold text-foreground mb-2"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedCategories.has(category) ? "" : "-rotate-90"
                  }`}
                />
                {category}
                <span className="ml-auto text-xs text-muted-foreground">{agents.length}</span>
              </button>

              {expandedCategories.has(category) && (
                <div className="space-y-1 ml-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedAgent === agent.id
                          ? "bg-accent/20 text-accent font-medium"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="font-medium truncate">{agent.name}</div>
                      <div className="text-xs opacity-75">{agent.creditCost} credits</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{user?.name}</div>
            <div className="text-xs">{user?.email}</div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mpesa Payment Modal */}
      <MpesaPaymentModal open={mpesaModalOpen} onOpenChange={setMpesaModalOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-card p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            {selectedAgentData && (
              <div className="text-center">
                <h1 className="text-2xl font-bold">{selectedAgentData.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{selectedAgentData.category}</p>
              </div>
            )}
          </div>
          <div className="w-10" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedAgentData ? (
            selectedAgentData.isEnterprise && user?.plan !== "enterprise" ? (
              <div className="w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="text-center space-y-6 max-w-lg p-8 border border-accent/20 rounded-2xl bg-card shadow-2xl">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-accent animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold gradient-text">Enterprise Access Required</h2>
                  <p className="text-muted-foreground text-lg">
                    The <span className="text-foreground font-semibold">{selectedAgentData.name}</span> agent is a premium module reserved for our Enterprise partners.
                  </p>
                  <div className="space-y-4">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-12" onClick={() => window.location.href = "/#pricing"}>
            )
          ) : (
                    </Button>
                    <Button variant="outline" className="w-full h-12" onClick={() => setSelectedAgent(null)}>
                      Back to Directory
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
            <div className="w-full h-full">
              <iframe
                ref={iframeRef}
                key={selectedAgentData.id}
                src={selectedAgentData.externalUrl || `/agents/${selectedAgentData.htmlFile}`}
                className="w-full h-full border-none"
                title={selectedAgentData.name}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-presentation"
                allow="geolocation; microphone; camera; payment; usb"
                onLoad={syncIframeWithState}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Select an Agent</h2>
                <p className="text-muted-foreground">
                  Choose an AI agent from the sidebar to get started. Each agent specializes in different healthcare tasks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
