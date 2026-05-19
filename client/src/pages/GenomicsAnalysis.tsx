import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Dna, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function GenomicsAnalysis() {
  const [activeTab, setActiveTab] = useState('sequence');
  const [loading, setLoading] = useState(false);

  // Sequence Analysis State
  const [sequenceData, setSequenceData] = useState('');
  const [referenceGenome, setReferenceGenome] = useState('GRCh38');
  const [analysisType, setAnalysisType] = useState('wes');
  const [sequenceResult, setSequenceResult] = useState<any>(null);

  // Genetic Screening State
  const [familyHistory, setFamilyHistory] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [screeningType, setScreeningType] = useState('cancer');
  const [screeningResult, setScreeningResult] = useState<any>(null);

  // Protein Folding State
  const [proteinSequence, setProteinSequence] = useState('');
  const [proteinName, setProteinName] = useState('');
  const [proteinResult, setProteinResult] = useState<any>(null);

  // Pan-Cancer State
  const [cancerType, setCancerType] = useState('');
  const [mutations, setMutations] = useState('');
  const [cancerStage, setCancerStage] = useState('');
  const [cancerResult, setCancerResult] = useState<any>(null);

  // tRPC mutations
  const analyzeSequenceMutation = trpc.genomics.analyzeSequence.useMutation();
  const screenGeneticsMutation = trpc.genomics.screenGenetics.useMutation();
  const predictProteinMutation = trpc.genomics.predictProteinStructure.useMutation();
  const analyzeCancerMutation = trpc.genomics.analyzePanCancer.useMutation();

  // Sequence Analysis Handler
  const handleSequenceAnalysis = async () => {
    if (!sequenceData.trim()) {
      toast.error('Please enter sequence data');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSequenceMutation.mutateAsync({
        sequenceData,
        referenceGenome,
        analysisType: analysisType as any,
      });
      setSequenceResult(result);
      toast.success(`Found ${result.variantCount} variants`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sequence analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Genetic Screening Handler
  const handleGeneticScreening = async () => {
    if (!familyHistory.trim()) {
      toast.error('Please enter family history');
      return;
    }

    setLoading(true);
    try {
      const result = await screenGeneticsMutation.mutateAsync({
        familyHistory,
        ethnicity: ethnicity || undefined,
        screeningType: screeningType as any,
      });
      setScreeningResult(result);
      toast.success(`Risk assessment complete: ${result.riskLevel}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Genetic screening failed');
    } finally {
      setLoading(false);
    }
  };

  // Protein Folding Handler
  const handleProteinPrediction = async () => {
    if (!proteinSequence.trim() || !proteinName.trim()) {
      toast.error('Please enter protein sequence and name');
      return;
    }

    setLoading(true);
    try {
      const result = await predictProteinMutation.mutateAsync({
        proteinSequence,
        proteinName,
      });
      setProteinResult(result);
      toast.success('Protein structure prediction complete');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Protein prediction failed');
    } finally {
      setLoading(false);
    }
  };

  // Pan-Cancer Analysis Handler
  const handleCancerAnalysis = async () => {
    if (!cancerType.trim() || !mutations.trim()) {
      toast.error('Please enter cancer type and mutations');
      return;
    }

    setLoading(true);
    try {
      const mutationList = mutations.split(',').map(m => m.trim());
      const result = await analyzeCancerMutation.mutateAsync({
        cancerType,
        mutations: mutationList,
        stage: cancerStage || undefined,
      });
      setCancerResult(result);
      toast.success('Pan-cancer analysis complete');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cancer analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Dna className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">Genomics Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Advanced genomic analysis with sequence alignment, genetic screening, protein folding, and pan-cancer analysis
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sequence">Sequence</TabsTrigger>
            <TabsTrigger value="screening">Screening</TabsTrigger>
            <TabsTrigger value="protein">Protein</TabsTrigger>
            <TabsTrigger value="cancer">Pan-Cancer</TabsTrigger>
          </TabsList>

          {/* Sequence Analysis Tab */}
          <TabsContent value="sequence" className="space-y-6">
            <Card className="p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-4">DNA/RNA Sequence Analysis</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sequence-data">Sequence Data (FASTA format)</Label>
                  <Textarea
                    id="sequence-data"
                    placeholder="Paste your DNA/RNA sequence here..."
                    value={sequenceData}
                    onChange={(e) => setSequenceData(e.target.value)}
                    className="mt-2 h-32"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reference">Reference Genome</Label>
                    <Select value={referenceGenome} onValueChange={setReferenceGenome}>
                      <SelectTrigger id="reference" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GRCh38">GRCh38 (Human)</SelectItem>
                        <SelectItem value="GRCh37">GRCh37 (Human)</SelectItem>
                        <SelectItem value="GRCm39">GRCm39 (Mouse)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="analysis-type">Analysis Type</Label>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger id="analysis-type" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wgs">Whole Genome Sequencing</SelectItem>
                        <SelectItem value="wes">Whole Exome Sequencing</SelectItem>
                        <SelectItem value="targeted">Targeted Sequencing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSequenceAnalysis}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Sequence'
                  )}
                </Button>
              </div>

              {sequenceResult && (
                <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border/30">
                  <h3 className="font-semibold mb-3">Analysis Results</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Variants Found:</span> {sequenceResult.variantCount}</p>
                    <p><span className="text-muted-foreground">Summary:</span> {sequenceResult.summary}</p>
                    {sequenceResult.variants.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium mb-2">Top Variants:</p>
                        {sequenceResult.variants.slice(0, 3).map((v: any, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {v.chromosome}:{v.position} {v.reference}→{v.alternate} ({v.variantType})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Genetic Screening Tab */}
          <TabsContent value="screening" className="space-y-6">
            <Card className="p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-4">Genetic Risk Screening</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="family-history">Family History</Label>
                  <Textarea
                    id="family-history"
                    placeholder="Describe relevant family medical history..."
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.target.value)}
                    className="mt-2 h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ethnicity">Ethnicity (Optional)</Label>
                    <Input
                      id="ethnicity"
                      placeholder="e.g., European, African, Asian"
                      value={ethnicity}
                      onChange={(e) => setEthnicity(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="screening-type">Screening Type</Label>
                    <Select value={screeningType} onValueChange={setScreeningType}>
                      <SelectTrigger id="screening-type" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cancer">Cancer Predisposition</SelectItem>
                        <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                        <SelectItem value="neurological">Neurological</SelectItem>
                        <SelectItem value="metabolic">Metabolic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGeneticScreening}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Screening...
                    </>
                  ) : (
                    'Run Genetic Screening'
                  )}
                </Button>
              </div>

              {screeningResult && (
                <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border/30">
                  <h3 className="font-semibold mb-3">Risk Assessment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        screeningResult.riskLevel === 'high' ? 'bg-red-500/10 text-red-700' :
                        screeningResult.riskLevel === 'moderate' ? 'bg-yellow-500/10 text-yellow-700' :
                        'bg-green-500/10 text-green-700'
                      }`}>
                        {screeningResult.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <p><span className="text-muted-foreground">Risk Score:</span> {screeningResult.riskScore.toFixed(2)}</p>
                    <p><span className="text-muted-foreground">Recommendations:</span> {screeningResult.recommendations}</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Protein Folding Tab */}
          <TabsContent value="protein" className="space-y-6">
            <Card className="p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-4">Protein Structure Prediction</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="protein-name">Protein Name/ID</Label>
                  <Input
                    id="protein-name"
                    placeholder="e.g., TP53, BRCA1"
                    value={proteinName}
                    onChange={(e) => setProteinName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="protein-sequence">Amino Acid Sequence</Label>
                  <Textarea
                    id="protein-sequence"
                    placeholder="Paste amino acid sequence (single letter code)..."
                    value={proteinSequence}
                    onChange={(e) => setProteinSequence(e.target.value)}
                    className="mt-2 h-24"
                  />
                </div>

                <Button
                  onClick={handleProteinPrediction}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    'Predict Structure'
                  )}
                </Button>
              </div>

              {proteinResult && (
                <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border/30">
                  <h3 className="font-semibold mb-3">Structure Prediction</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Confidence Score:</span> {(proteinResult.confidenceScore * 100).toFixed(1)}%</p>
                    <p><span className="text-muted-foreground">Predicted Function:</span> {proteinResult.predictedFunction}</p>
                    {proteinResult.drugInteractions?.length > 0 && (
                      <p><span className="text-muted-foreground">Drug Interactions:</span> {proteinResult.drugInteractions.join(', ')}</p>
                    )}
                    {proteinResult.therapeuticTargets?.length > 0 && (
                      <p><span className="text-muted-foreground">Therapeutic Targets:</span> {proteinResult.therapeuticTargets.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Pan-Cancer Analysis Tab */}
          <TabsContent value="cancer" className="space-y-6">
            <Card className="p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-4">Pan-Cancer Analysis</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cancer-type">Cancer Type</Label>
                  <Input
                    id="cancer-type"
                    placeholder="e.g., Breast Cancer, Lung Cancer"
                    value={cancerType}
                    onChange={(e) => setCancerType(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="mutations">Mutations (comma-separated)</Label>
                  <Textarea
                    id="mutations"
                    placeholder="e.g., TP53 R175H, BRCA1 185delAG, EGFR L858R"
                    value={mutations}
                    onChange={(e) => setMutations(e.target.value)}
                    className="mt-2 h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="cancer-stage">Cancer Stage (Optional)</Label>
                  <Select value={cancerStage} onValueChange={setCancerStage}>
                    <SelectTrigger id="cancer-stage" className="mt-2">
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Stage I</SelectItem>
                      <SelectItem value="II">Stage II</SelectItem>
                      <SelectItem value="III">Stage III</SelectItem>
                      <SelectItem value="IV">Stage IV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCancerAnalysis}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Cancer Profile'
                  )}
                </Button>
              </div>

              {cancerResult && (
                <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border/30">
                  <h3 className="font-semibold mb-3">Cancer Analysis Results</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">TMB:</span> {cancerResult.tumorMutationalBurden.toFixed(2)}</p>
                    <p><span className="text-muted-foreground">Risk Score:</span> {cancerResult.riskScore.toFixed(2)}</p>
                    <p><span className="text-muted-foreground">Prognosis:</span> {cancerResult.prognosis}</p>
                    {cancerResult.biomarkers?.length > 0 && (
                      <p><span className="text-muted-foreground">Biomarkers:</span> {cancerResult.biomarkers.join(', ')}</p>
                    )}
                    {cancerResult.treatmentRecommendations?.length > 0 && (
                      <div>
                        <p className="font-medium mt-2">Treatment Recommendations:</p>
                        {cancerResult.treatmentRecommendations.map((rec: string, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground ml-2">• {rec}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
