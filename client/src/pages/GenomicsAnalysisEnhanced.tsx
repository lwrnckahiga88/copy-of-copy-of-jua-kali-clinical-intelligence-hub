import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Dna, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';

export default function GenomicsAnalysisEnhanced() {
  const [activeTab, setActiveTab] = useState('multi-cancer');
  const [loading, setLoading] = useState(false);

  // Multi-Cancer Analysis State
  const [cancerType, setCancerType] = useState<string>('breast');
  const [biomarkers, setBiomarkers] = useState('');
  const [stage, setStage] = useState<string>('II');
  const [grade, setGrade] = useState('2');
  const [multiCancerResult, setMultiCancerResult] = useState<any>(null);

  // Blood Disorder Analysis State
  const [disorderType, setDisorderType] = useState<string>('hemophilia_a');
  const [geneticMutations, setGeneticMutations] = useState('');
  const [bloodDisorderResult, setBloodDisorderResult] = useState<any>(null);

  // tRPC queries and mutations
  const supportedCancers = trpc.genomics.getSupportedCancerTypes.useQuery();
  const supportedDisorders = trpc.genomics.getSupportedBloodDisorders.useQuery();
  const multiCancerMutation = trpc.genomics.analyzeMultiCancer.useMutation();
  const bloodDisorderMutation = trpc.genomics.analyzeBloodDisorder.useMutation();

  // Multi-Cancer Analysis Handler
  const handleMultiCancerAnalysis = async () => {
    if (!biomarkers.trim()) {
      toast.error('Please enter at least one biomarker');
      return;
    }

    setLoading(true);
    try {
      const result = await multiCancerMutation.mutateAsync({
        cancerType: cancerType as any,
        biomarkers: biomarkers.split(',').map(b => b.trim()),
        stage: stage as any,
        grade,
      });
      setMultiCancerResult(result);
      toast.success(`Analysis complete for ${cancerType} cancer`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Multi-cancer analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Blood Disorder Analysis Handler
  const handleBloodDisorderAnalysis = async () => {
    if (!disorderType) {
      toast.error('Please select a blood disorder');
      return;
    }

    setLoading(true);
    try {
      const result = await bloodDisorderMutation.mutateAsync({
        disorderType: disorderType as any,
        geneticMutations: geneticMutations.split(',').map(m => m.trim()).filter(Boolean),
      });
      setBloodDisorderResult(result);
      toast.success(`Analysis complete for ${disorderType}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Blood disorder analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Dna className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Genomics Analysis</h1>
          </div>
          <p className="text-slate-600">Comprehensive multi-cancer and blood disorder analysis with real-time agent synchronization</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="multi-cancer">Multi-Cancer Analysis</TabsTrigger>
            <TabsTrigger value="blood-disorder">Blood Disorder Analysis</TabsTrigger>
          </TabsList>

          {/* Multi-Cancer Tab */}
          <TabsContent value="multi-cancer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Panel */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Cancer Analysis</CardTitle>
                  <CardDescription>Select cancer type and biomarkers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cancer Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="cancer-type">Cancer Type</Label>
                    <Select value={cancerType} onValueChange={setCancerType}>
                      <SelectTrigger id="cancer-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCancers.data?.cancerTypes?.map((cancer) => (
                          <SelectItem key={cancer} value={cancer}>
                            {cancer.charAt(0).toUpperCase() + cancer.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stage Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="stage">Cancer Stage</Label>
                    <Select value={stage} onValueChange={setStage}>
                      <SelectTrigger id="stage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">Stage I</SelectItem>
                        <SelectItem value="II">Stage II</SelectItem>
                        <SelectItem value="III">Stage III</SelectItem>
                        <SelectItem value="IV">Stage IV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grade Input */}
                  <div className="space-y-2">
                    <Label htmlFor="grade">Histological Grade</Label>
                    <Input
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="1-4"
                    />
                  </div>

                  {/* Biomarkers Input */}
                  <div className="space-y-2">
                    <Label htmlFor="biomarkers">Biomarkers (comma-separated)</Label>
                    <Textarea
                      id="biomarkers"
                      value={biomarkers}
                      onChange={(e) => setBiomarkers(e.target.value)}
                      placeholder="e.g., BRCA1, TP53, HER2"
                      className="min-h-24"
                    />
                  </div>

                  <Button
                    onClick={handleMultiCancerAnalysis}
                    disabled={loading || !biomarkers.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Dna className="w-4 h-4 mr-2" />
                        Analyze Cancer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <div className="lg:col-span-2 space-y-6">
                {multiCancerResult && (
                  <>
                    {/* Cancer Profile */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          Cancer Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Cancer Type</p>
                            <p className="text-lg font-semibold">{multiCancerResult.cancerProfile?.cancerType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">Stage</p>
                            <p className="text-lg font-semibold">{multiCancerResult.cancerProfile?.stage}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">TMB</p>
                            <p className="text-lg font-semibold">{multiCancerResult.cancerProfile?.tumorMutationalBurden}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">Immune Infiltration</p>
                            <Badge variant="outline">{multiCancerResult.cancerProfile?.immuneInfiltration}</Badge>
                          </div>
                        </div>

                        {/* Survival Estimates */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-slate-600 mb-3">Estimated Survival</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-xs text-slate-600">1-Year</p>
                              <p className="text-lg font-bold text-blue-600">
                                {multiCancerResult.cancerProfile?.estimatedSurvival?.oneYear}%
                              </p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded">
                              <p className="text-xs text-slate-600">3-Year</p>
                              <p className="text-lg font-bold text-purple-600">
                                {multiCancerResult.cancerProfile?.estimatedSurvival?.threeYear}%
                              </p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded">
                              <p className="text-xs text-slate-600">5-Year</p>
                              <p className="text-lg font-bold text-orange-600">
                                {multiCancerResult.cancerProfile?.estimatedSurvival?.fiveYear}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Biomarkers */}
                    {multiCancerResult.cancerProfile?.biomarkers?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Detected Biomarkers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {multiCancerResult.cancerProfile.biomarkers.map((biomarker: any, idx: number) => (
                              <div key={idx} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-semibold">{biomarker.gene}</p>
                                    <p className="text-sm text-slate-600">{biomarker.mutation}</p>
                                  </div>
                                  <Badge variant={biomarker.prognostic === 'favorable' ? 'default' : 'destructive'}>
                                    {biomarker.prognostic}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-700 mb-2">{biomarker.clinicalSignificance}</p>
                                {biomarker.targetedTherapies?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {biomarker.targetedTherapies.map((therapy: string, tidx: number) => (
                                      <Badge key={tidx} variant="secondary" className="text-xs">
                                        {therapy}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Treatment Recommendations */}
                    {multiCancerResult.treatments?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Treatment Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {multiCancerResult.treatments.map((treatment: any, idx: number) => (
                              <div key={idx} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-semibold">{treatment.treatmentName}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {treatment.category}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">Efficacy: {treatment.efficacyScore}%</p>
                                    <p className="text-xs text-slate-600">Toxicity: {treatment.toxicityScore}%</p>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-700">{treatment.clinicalEvidence}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Clinical Summary */}
                    {multiCancerResult.clinicalSummary && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Clinical Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Streamdown>{multiCancerResult.clinicalSummary}</Streamdown>
                        </CardContent>
                      </Card>
                    )}

                    {/* Shared Agents */}
                    {multiCancerResult.sharedAgents?.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Analysis shared with: {multiCancerResult.sharedAgents.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Blood Disorder Tab */}
          <TabsContent value="blood-disorder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Panel */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Blood Disorder Analysis</CardTitle>
                  <CardDescription>Select disorder and genetic mutations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Disorder Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="disorder-type">Blood Disorder</Label>
                    <Select value={disorderType} onValueChange={setDisorderType}>
                      <SelectTrigger id="disorder-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedDisorders.data?.bloodDisorders?.map((disorder) => (
                          <SelectItem key={disorder} value={disorder}>
                            {disorder.replace(/_/g, ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Genetic Mutations Input */}
                  <div className="space-y-2">
                    <Label htmlFor="mutations">Genetic Mutations (comma-separated)</Label>
                    <Textarea
                      id="mutations"
                      value={geneticMutations}
                      onChange={(e) => setGeneticMutations(e.target.value)}
                      placeholder="e.g., F8, F9, HBB"
                      className="min-h-24"
                    />
                  </div>

                  <Button
                    onClick={handleBloodDisorderAnalysis}
                    disabled={loading || !disorderType}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Dna className="w-4 h-4 mr-2" />
                        Analyze Disorder
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <div className="lg:col-span-2 space-y-6">
                {bloodDisorderResult && (
                  <>
                    {/* Disorder Profile */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          Disorder Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Disorder</p>
                            <p className="text-lg font-semibold">
                              {bloodDisorderResult.disorderProfile?.disorderType?.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">Severity</p>
                            <Badge variant="outline">{bloodDisorderResult.disorderProfile?.severity}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">Inheritance</p>
                            <p className="text-sm">{bloodDisorderResult.disorderProfile?.inheritancePattern?.replace(/_/g, ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">Genetic Basis</p>
                            <p className="text-sm">{bloodDisorderResult.disorderProfile?.geneticBasis}</p>
                          </div>
                        </div>

                        {/* Risk Scores */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-slate-600 mb-3">Risk Assessment</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-red-50 p-3 rounded">
                              <p className="text-xs text-slate-600">Bleeding Risk</p>
                              <p className="text-lg font-bold text-red-600">
                                {bloodDisorderResult.disorderProfile?.bleedingRiskScore}%
                              </p>
                            </div>
                            <div className="bg-red-50 p-3 rounded">
                              <p className="text-xs text-slate-600">Thrombosis Risk</p>
                              <p className="text-lg font-bold text-red-600">
                                {bloodDisorderResult.disorderProfile?.thrombosisRiskScore}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Management Strategy */}
                        {bloodDisorderResult.disorderProfile?.managementStrategy?.length > 0 && (
                          <div className="border-t pt-4">
                            <p className="text-sm font-medium text-slate-600 mb-2">Management Strategy</p>
                            <div className="space-y-2">
                              {bloodDisorderResult.disorderProfile.managementStrategy.map((strategy: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm">{strategy}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Clinical Recommendations */}
                    {bloodDisorderResult.recommendations && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Clinical Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Streamdown>{bloodDisorderResult.recommendations}</Streamdown>
                        </CardContent>
                      </Card>
                    )}

                    {/* Shared Agents */}
                    {bloodDisorderResult.sharedAgents?.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Analysis shared with: {bloodDisorderResult.sharedAgents.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
