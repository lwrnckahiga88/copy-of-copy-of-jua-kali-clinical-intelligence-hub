import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2, Dna, Beaker } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BioinformaticsAnalysis() {
  const [sampleId, setSampleId] = useState("sample_001");
  const [bamFile, setBamFile] = useState("sample.bam");
  const [referenceGenome, setReferenceGenome] = useState("hg38");
  const [proteinSequence, setProteinSequence] = useState("MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQTLGQHDFSAGEGLYTHMKALRPDEDRLSPLHSVYVDQWDWERVMGDGERQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDGHRHDVRAPDYDDWSTPSELGHAGLNGDILVWNPVLEDAFELSSMGIRVDADTLKHQLALTGDEDRLELEWHQALLRGEMPQTIGGGIGQSRLTMLLLQLPHIGQVQAGVWPAAVRESVPSLL");
  const [activeTab, setActiveTab] = useState("input");

  const runPipelineMutation = trpc.bioinformatics.runPipeline.useMutation();
  const callVariantsMutation = trpc.bioinformatics.callVariants.useMutation();
  const alignSequenceMutation = trpc.bioinformatics.alignSequence.useMutation();
  const predictStructureMutation = trpc.bioinformatics.predictStructure.useMutation();
  const predictDrugsMutation = trpc.bioinformatics.predictDrugInteractions.useMutation();

  const handleRunPipeline = async () => {
    setActiveTab("results");
    await runPipelineMutation.mutateAsync({
      sampleId,
      bamFile,
      referenceGenome,
      proteinSequence,
    });
  };

  const handleCallVariants = async () => {
    await callVariantsMutation.mutateAsync({
      bamFile,
      referenceGenome,
    });
  };

  const handleAlignSequence = async () => {
    await alignSequenceMutation.mutateAsync({
      querySequence: proteinSequence,
      referenceGenome,
    });
  };

  const handlePredictStructure = async () => {
    await predictStructureMutation.mutateAsync({
      proteinSequence,
      proteinId: sampleId,
    });
  };

  const handlePredictDrugs = async () => {
    await predictDrugsMutation.mutateAsync({
      proteinId: sampleId,
      drugNames: ["Paclitaxel", "Doxorubicin", "Cisplatin", "Trastuzumab", "Tamoxifen"],
      proteinSequence,
    });
  };

  const pipelineData = runPipelineMutation.data?.data as Record<string, any> | undefined;
  const variantsData = callVariantsMutation.data as Record<string, any> | undefined;
  const alignmentData = alignSequenceMutation.data as Record<string, any> | undefined;
  const structureData = predictStructureMutation.data as Record<string, any> | undefined;
  const drugsData = predictDrugsMutation.data as Record<string, any> | undefined;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Dna className="text-blue-600" />
          Bioinformatics Analysis Pipeline
        </h1>
        <p className="text-muted-foreground mt-2">
          Advanced genomic analysis with GATK variant calling, BWA alignment, and AlphaFold protein structure prediction
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Input & Analysis</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Information</CardTitle>
              <CardDescription>Configure your bioinformatics analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sampleId">Sample ID</Label>
                  <Input
                    id="sampleId"
                    value={sampleId}
                    onChange={(e) => setSampleId(e.target.value)}
                    placeholder="e.g., sample_001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bamFile">BAM File</Label>
                  <Input
                    id="bamFile"
                    value={bamFile}
                    onChange={(e) => setBamFile(e.target.value)}
                    placeholder="e.g., sample.bam"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceGenome">Reference Genome</Label>
                <Input
                  id="referenceGenome"
                  value={referenceGenome}
                  onChange={(e) => setReferenceGenome(e.target.value)}
                  placeholder="e.g., hg38"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proteinSequence">Protein Sequence</Label>
                <textarea
                  id="proteinSequence"
                  value={proteinSequence}
                  onChange={(e) => setProteinSequence(e.target.value)}
                  placeholder="Enter amino acid sequence..."
                  className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="text-blue-600" />
                Analysis Options
              </CardTitle>
              <CardDescription>Select which analyses to run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleRunPipeline}
                disabled={runPipelineMutation.isPending}
                className="w-full"
                size="lg"
              >
                {runPipelineMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Full Pipeline...
                  </>
                ) : (
                  "Run Full Pipeline"
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleCallVariants}
                  disabled={callVariantsMutation.isPending}
                  variant="outline"
                >
                  {callVariantsMutation.isPending ? "Calling..." : "Call Variants (GATK)"}
                </Button>
                <Button
                  onClick={handleAlignSequence}
                  disabled={alignSequenceMutation.isPending}
                  variant="outline"
                >
                  {alignSequenceMutation.isPending ? "Aligning..." : "Align Sequence (BWA)"}
                </Button>
                <Button
                  onClick={handlePredictStructure}
                  disabled={predictStructureMutation.isPending}
                  variant="outline"
                >
                  {predictStructureMutation.isPending ? "Predicting..." : "Predict Structure"}
                </Button>
                <Button
                  onClick={handlePredictDrugs}
                  disabled={predictDrugsMutation.isPending}
                  variant="outline"
                >
                  {predictDrugsMutation.isPending ? "Predicting..." : "Predict Drug Interactions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {runPipelineMutation.isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Running bioinformatics pipeline... This may take a moment.</AlertDescription>
            </Alert>
          )}

          {pipelineData && (
            <>
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" />
                    Pipeline Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Variants Found</p>
                    <p className="text-2xl font-bold text-green-600">{pipelineData.variantCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Alignment Quality</p>
                    <p className="text-2xl font-bold text-green-600">{pipelineData.alignmentQuality.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Structure Confidence</p>
                    <p className="text-2xl font-bold text-green-600">{(pipelineData.structureConfidence * 100).toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Drug Interactions</p>
                    <p className="text-2xl font-bold text-green-600">{pipelineData.drugInteractionCount}</p>
                  </div>
                </CardContent>
              </Card>

              {pipelineData.variants && pipelineData.variants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Variant Calling Results (GATK)</CardTitle>
                    <CardDescription>{pipelineData.variants.length} variants identified</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pipelineData.variants.map((variant: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{variant.variantId}</span>
                            <Badge className={getImpactColor(variant.annotation.impact)}>
                              {variant.annotation.impact}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Gene: </span>
                              <span className="font-mono">{variant.annotation.gene}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type: </span>
                              <span className="font-mono">{variant.type}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">AF: </span>
                              <span className="font-mono">{(variant.alleleFrequency * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{variant.annotation.consequence}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {pipelineData.alignment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sequence Alignment Results (BWA)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Match Percentage</p>
                        <p className="text-2xl font-bold">{pipelineData.alignment.matchPercentage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Alignment Score</p>
                        <p className="text-2xl font-bold">{pipelineData.alignment.alignmentScore}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gaps</p>
                        <p className="text-lg font-semibold">{pipelineData.alignment.gaps}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mismatches</p>
                        <p className="text-lg font-semibold">{pipelineData.alignment.mismatches}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CIGAR String</p>
                      <p className="font-mono text-sm bg-muted p-2 rounded mt-1">{pipelineData.alignment.cigarString}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {pipelineData.structure && (
                <Card>
                  <CardHeader>
                    <CardTitle>Protein Structure Prediction (AlphaFold)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Prediction Confidence</p>
                        <p className="text-2xl font-bold">{(pipelineData.structure.structure.confidence * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Folding Energy</p>
                        <p className="text-lg font-semibold">{pipelineData.structure.predictions.foldingEnergy.toFixed(1)} kcal/mol</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Functional Domains</p>
                      <div className="space-y-2">
                        {pipelineData.structure.predictions.functionalDomains.map((domain: any, idx: number) => (
                          <div key={idx} className="text-sm bg-muted p-2 rounded">
                            <span className="font-semibold">{domain.name}</span>
                            <span className="text-muted-foreground ml-2">({domain.start}-{domain.end})</span>
                            <p className="text-xs text-muted-foreground mt-1">{domain.function}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {pipelineData.drugInteractions && pipelineData.drugInteractions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Drug Interaction Predictions</CardTitle>
                    <CardDescription>{pipelineData.drugInteractions.length} drugs analyzed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pipelineData.drugInteractions.map((drug: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{drug.drugName}</span>
                            <Badge variant={drug.efficacyScore > 0.8 ? "default" : "secondary"}>
                              Efficacy: {(drug.efficacyScore * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Binding Affinity: </span>
                              <span className="font-mono">{drug.bindingAffinity.toFixed(1)} kcal/mol</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type: </span>
                              <span className="font-mono capitalize">{drug.interactionType}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Toxicity Risk: </span>
                              <Badge variant="outline" className="ml-1">{drug.toxicityRisk}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {variantsData && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Found {variantsData.count} variants
              </AlertDescription>
            </Alert>
          )}

          {alignmentData && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Alignment quality: {alignmentData.alignment.matchPercentage.toFixed(1)}%
              </AlertDescription>
            </Alert>
          )}

          {structureData && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Structure prediction confidence: {(structureData.structure.structure.confidence * 100).toFixed(1)}%
              </AlertDescription>
            </Alert>
          )}

          {drugsData && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Top drug: {drugsData.topDrug.drugName} (Efficacy: {(drugsData.topDrug.efficacyScore * 100).toFixed(1)}%)
              </AlertDescription>
            </Alert>
          )}

          {!pipelineData && !variantsData && !alignmentData && !structureData && !drugsData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Run an analysis to see results here
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
