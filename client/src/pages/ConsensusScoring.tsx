import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

interface AgentAnalysis {
  agentId: string;
  agentName: string;
  result: string;
  confidence: number;
}

export default function ConsensusScoring() {
  const [analysisType, setAnalysisType] = useState<"diagnosis" | "treatment" | "prognosis" | "risk_assessment">("diagnosis");
  const [agentAnalyses, setAgentAnalyses] = useState<AgentAnalysis[]>([
    {
      agentId: "medos",
      agentName: "Medos",
      result: "Likely breast cancer with HER2 positive status",
      confidence: 0.92,
    },
    {
      agentId: "clinicalvalidator",
      agentName: "Clinical Validator",
      result: "Breast cancer diagnosis supported by imaging and biomarkers",
      confidence: 0.88,
    },
    {
      agentId: "genomica",
      agentName: "Genomica",
      result: "BRCA1 mutation detected, consistent with hereditary breast cancer",
      confidence: 0.95,
    },
  ]);

  const calculateConsensusMutation = trpc.consensus.calculateConsensus.useMutation();
  const compareAnalysesMutation = trpc.consensus.compareAnalyses.useQuery({ analyses: agentAnalyses }, { enabled: false });
  const getRecommendationsMutation = trpc.consensus.getRecommendations.useQuery({ consensusResult: '', analysisType: 'diagnosis' }, { enabled: false });

  const handleCalculateConsensus = async () => {
    const analyses = agentAnalyses.map((a) => ({
      ...a,
      analysisType: analysisType as "diagnosis" | "treatment" | "prognosis" | "risk_assessment",
      confidence: a.confidence,
    }));

    await calculateConsensusMutation.mutateAsync({ analyses });
  };

  const handleCompareAnalyses = async () => {
    // This is a query, not a mutation - would need to be refactored
    console.log('Compare analyses - would need query refactoring');
  };

  const consensusData = calculateConsensusMutation.data?.consensus as Record<string, any> | undefined;
  const comparisonData = compareAnalysesMutation.data?.comparison as Record<string, any> | undefined;
  const recommendationsData = getRecommendationsMutation.data as Record<string, any> | undefined;

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Multi-Agent Consensus Scoring</h1>
        <p className="text-muted-foreground mt-2">
          Synthesize findings from multiple medical AI agents to improve diagnostic confidence
        </p>
      </div>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Input Analyses</TabsTrigger>
          <TabsTrigger value="consensus">Consensus Results</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Input Analyses Tab */}
        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Type</CardTitle>
              <CardDescription>Select the type of analysis to perform consensus on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(["diagnosis", "treatment", "prognosis", "risk_assessment"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={analysisType === type ? "default" : "outline"}
                    onClick={() => setAnalysisType(type)}
                    className="capitalize"
                  >
                    {type.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Analyses</CardTitle>
              <CardDescription>Current analyses from {agentAnalyses.length} agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agentAnalyses.map((analysis, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{analysis.agentName}</h4>
                    <Badge variant="secondary">
                      {((analysis.confidence as number) * 100).toFixed(1)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.result}</p>
                  <Progress value={(analysis.confidence as number) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleCalculateConsensus}
              disabled={calculateConsensusMutation.isPending}
              className="flex-1"
            >
              {calculateConsensusMutation.isPending ? "Calculating..." : "Calculate Consensus"}
            </Button>
            <Button
              onClick={handleCompareAnalyses}
              disabled={false}
              variant="outline"
              className="flex-1"
            >
              Compare Analyses
            </Button>
          </div>
        </TabsContent>

        {/* Consensus Results Tab */}
        <TabsContent value="consensus" className="space-y-4">
          {consensusData && (
            <>
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" />
                    Consensus Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg">{consensusData.result}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence Level</p>
                      <Badge className={`mt-1 ${getConfidenceBadgeColor((consensusData?.confidence as any)?.level || 'medium')}`}>
                        {((consensusData?.confidence as any)?.level || 'medium').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Agreement Score</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {(consensusData?.confidence as any)?.score || 'N/A'}
                      </p>
                    </div>
                  </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Participating Agents ({(consensusData?.agentCount as number) || 0})</p>
                      <div className="space-y-2">
                        {(consensusData?.agents as any[] || []).map((agent: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{agent.name}</span>
                          <span className="text-muted-foreground">{agent.confidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clinical Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{(consensusData?.summary as string) || 'No summary available'}</p>
                </CardContent>
              </Card>
            </>
          )}

          {comparisonData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Analysis Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Agents</p>
                    <p className="text-2xl font-bold">{comparisonData.totalAgents}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Agreement Score</p>
                    <p className="text-2xl font-bold text-blue-600">{comparisonData.agreementScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Confidence Level</p>
                    <Badge className={`mt-1 ${getConfidenceBadgeColor(comparisonData.confidenceLevel)}`}>
                      {comparisonData.confidenceLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-3">Agent Confidence Breakdown</p>
                    <div className="space-y-3">
                      {(comparisonData?.agents as any[] || []).map((agent: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{agent.name}</span>
                          <span className="text-sm font-semibold">{agent.confidence}</span>
                        </div>
                        <Progress value={parseFloat(agent.confidence)} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{comparisonData.summary}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {!consensusData && !comparisonData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Click "Calculate Consensus" or "Compare Analyses" to see results here
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {consensusData && (
            <Card>
              <CardHeader>
                <CardTitle>Clinical Recommendations</CardTitle>
                <CardDescription>
                  Based on multi-agent consensus analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {((consensusData?.recommendations as any[]) || []).map((rec: any, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-shrink-0 text-blue-600 font-bold">{idx + 1}.</div>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!consensusData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Calculate consensus first to see recommendations
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
