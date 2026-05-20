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
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 border-r border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden flex flex-col z-20`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/50 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                <Microscope className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="font-bold text-xl gradient-text">Jua Kali</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credit Balance Card */}
          <div className="card-premium border-accent/20 bg-accent/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Available Credits</span>
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div className="text-4xl font-bold text-accent tracking-tight">{credits}</div>
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-10 shadow-lg shadow-accent/10"
              onClick={() => setMpesaModalOpen(true)}
            >
              Top Up Credits
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search AI agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-border/50 h-10 focus:ring-accent/20"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null
                  ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {getAllCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {Object.entries(groupedAgents).map(([category, agents]) => (
            <div key={category} className="space-y-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    expandedCategories.has(category) ? "" : "-rotate-90"
                  }`}
                />
                {category}
                <span className="ml-auto bg-muted px-1.5 py-0.5 rounded text-[10px]">{agents.length}</span>
              </button>

              {expandedCategories.has(category) && (
                <div className="space-y-1 animate-fade-in">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
                        selectedAgent === agent.id
                          ? "bg-accent/10 border border-accent/20 text-accent"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">{agent.name}</span>
                        {agent.isEnterprise && (
                          <Shield className="w-3 h-3 text-accent/60" />
                        )}
                      </div>
                      <div className="text-[10px] opacity-60 mt-0.5 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> {agent.creditCost} credits
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Mpesa Payment Modal */}
      <MpesaPaymentModal open={mpesaModalOpen} onOpenChange={setMpesaModalOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative bg-background">
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            {selectedAgentData ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">{selectedAgentData.name}</h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">{selectedAgentData.category}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Microscope className="w-4 h-4 text-accent" />
                </div>
                <h1 className="text-lg font-bold">Intelligence Hub</h1>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">System Online</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {selectedAgentData ? (
            <div className="w-full h-full animate-fade-in">
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
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="max-w-2xl w-full space-y-12 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
                  <div className="relative w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 shadow-2xl">
                    <Zap className="w-12 h-12 text-accent animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold tracking-tight">Welcome to Jua Kali Hub</h2>
                  <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                    Select a specialized AI agent from the sidebar to begin your clinical analysis or research workflow.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {[
                    { title: "Epidemiology", desc: "Predictive pandemic monitoring and SEIRD modeling." },
                    { title: "Genomics", desc: "Advanced sequencing and variant analysis platform." },
                    { title: "Imaging", desc: "Next-gen oncology diagnostics and analysis." }
                  ].map((feat, i) => (
                    <div key={i} className="card-premium bg-card/50 border-accent/5 p-6">
                      <h3 className="font-bold text-accent mb-2">{feat.title}</h3>
                      <p className="text-sm text-muted-foreground">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
