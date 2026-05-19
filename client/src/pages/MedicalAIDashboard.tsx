import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface Agent {
  id: string;
  name: string;
  description: string;
  htmlFile: string;
  category: string;
  status: 'active' | 'loading' | 'error';
  lastSync?: Date;
  creditsPerUse: number;
}

const MEDICAL_AGENTS: Agent[] = [
  {
    id: 'medos',
    name: 'Medos',
    description: 'Medical Decision Support System - Tertiary care analysis and clinical decision support',
    htmlFile: '/agents/tertiary.html',
    category: 'Clinical Decision Support',
    status: 'active',
    creditsPerUse: 50,
  },
  {
    id: 'nurseai',
    name: 'NurseAI',
    description: 'Nursing care planning and patient management system with evidence-based protocols',
    htmlFile: '/agents/NurseAI.html',
    category: 'Nursing Care',
    status: 'active',
    creditsPerUse: 30,
  },
  {
    id: 'genomica',
    name: 'Genomica',
    description: 'Advanced genomic analysis and mutation interpretation for precision medicine',
    htmlFile: '/agents/Genomica.html',
    category: 'Genomics',
    status: 'active',
    creditsPerUse: 75,
  },
  {
    id: 'quorumdee',
    name: 'QuorumDeep',
    description: 'Deep learning-based clinical pattern recognition and predictive analytics',
    htmlFile: '/agents/QuorumDeep.html',
    category: 'AI Analytics',
    status: 'active',
    creditsPerUse: 60,
  },
  {
    id: 'clinicalvalidator',
    name: 'Clinical Validator',
    description: 'Clinical validation workflow and evidence-based medicine verification system',
    htmlFile: '/agents/clinValidAi.html',
    category: 'Clinical Validation',
    status: 'active',
    creditsPerUse: 45,
  },
  {
    id: 'kemci',
    name: 'kEMCI',
    description: 'Knowledge-Enhanced Medical Clinical Intelligence for integrated diagnostics',
    htmlFile: '/agents/K-EMCI.html',
    category: 'Diagnostics',
    status: 'active',
    creditsPerUse: 55,
  },
];

export default function MedicalAIDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<Agent>(MEDICAL_AGENTS[0]!);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'synced' | 'syncing' | 'error'>>({});
  const [agentStates, setAgentStates] = useState<Record<string, Agent>>(
    Object.fromEntries(MEDICAL_AGENTS.map(a => [a.id, a]))
  );

  // Get shared data from agent sync
  const { data: sharedData, isLoading: isLoadingShared } = trpc.agent.getAllSharedData.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Track agent usage
  const trackUsageMutation = trpc.payment.trackAgentUsage.useMutation();

  // Sync agent data
  const syncAgentDataMutation = trpc.agent.shareData.useMutation();

  useEffect(() => {
    // Initialize sync status
    const initialSync = Object.fromEntries(
      MEDICAL_AGENTS.map(a => [a.id, 'synced' as const])
    );
    setSyncStatus(initialSync);
  }, []);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setIframeLoaded(false);
    
    // Track agent usage
    if (isAuthenticated && user) {
      trackUsageMutation.mutate({
        agentName: agent.name,
        creditsUsed: agent.creditsPerUse,
        analysisType: agent.category,
      });
    }

    // Update sync status
    setSyncStatus(prev => ({
      ...prev,
      [agent.id]: 'syncing',
    }));

    // Simulate sync completion
    setTimeout(() => {
      setSyncStatus(prev => ({
        ...prev,
        [agent.id]: 'synced',
      }));
    }, 1500);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const getSyncIcon = (status: 'synced' | 'syncing' | 'error') => {
    switch (status) {
      case 'synced':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'syncing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Medical AI Dashboard</CardTitle>
            <CardDescription>Please log in to access medical AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You need to be authenticated to access the medical AI dashboard and its integrated agents.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical AI Dashboard</h1>
          <p className="text-lg text-gray-600">
            Integrated medical AI agents for comprehensive clinical decision support
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Medical AI Agents</CardTitle>
                <CardDescription>Click to activate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {MEDICAL_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedAgent.id === agent.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{agent.name}</p>
                        <p className="text-xs opacity-75">{agent.category}</p>
                      </div>
                      <div className="ml-2">
                        {getSyncIcon(syncStatus[agent.id] || 'synced')}
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Shared Data Panel */}
            {sharedData && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Shared Data</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  {isLoadingShared ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-gray-600">Last sync: {new Date().toLocaleTimeString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {MEDICAL_AGENTS.length} agents synced
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Agent Content Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedAgent.name}</CardTitle>
                    <CardDescription className="mt-2">{selectedAgent.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-2">{selectedAgent.category}</Badge>
                    <p className="text-sm text-gray-600">
                      {selectedAgent.creditsPerUse} credits per use
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!iframeLoaded && (
                  <div className="flex items-center justify-center h-96 bg-gray-50">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Loading {selectedAgent.name}...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={selectedAgent.htmlFile}
                  className={`w-full ${iframeLoaded ? 'h-96 md:h-[600px]' : 'hidden'}`}
                  onLoad={handleIframeLoad}
                  title={selectedAgent.name}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agent Status Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEDICAL_AGENTS.map(agent => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{agent.category}</CardDescription>
                    </div>
                    <div>
                      {getSyncIcon(syncStatus[agent.id] || 'synced')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-gray-600 line-clamp-2">{agent.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">Credits: {agent.creditsPerUse}</span>
                    <Badge variant="secondary" className="text-xs">
                      {syncStatus[agent.id] === 'synced' ? 'Synced' : 'Syncing...'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
