import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Image, Upload, BarChart3, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function ImagingDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedImageType, setSelectedImageType] = useState<"ct" | "mri" | "xray" | "ultrasound" | "pet" | "mammography">("ct");
  const [patientId, setPatientId] = useState("");
  const [clinicalIndication, setClinicalIndication] = useState("");

  const { data: stats } = trpc.imaging.getImagingStats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: images, isLoading: imagesLoading } = trpc.imaging.getUserImages.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  const uploadMutation = trpc.imaging.uploadImage.useMutation();
  const analyzeMutation = trpc.imaging.analyzeImage.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center">
          <Image className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Medical Imaging Dashboard</h1>
          <p className="text-slate-300 mb-6">AI-powered medical image analysis</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-cyan-600 hover:bg-cyan-700">
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Image className="h-8 w-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Medical Imaging Dashboard</h1>
          </div>
          <p className="text-slate-400">AI-powered medical image analysis and interpretation</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Images</p>
                  <p className="text-3xl font-bold text-cyan-300">{stats.totalImages}</p>
                </div>
                <Image className="h-8 w-8 text-cyan-400 opacity-50" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Abnormalities Found</p>
                  <p className="text-3xl font-bold text-orange-300">{stats.abnormalitiesDetected}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400 opacity-50" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Risk Score</p>
                  <p className="text-3xl font-bold text-red-300">{stats.averageRiskScore}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-red-400 opacity-50" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Image Types</p>
                  <p className="text-3xl font-bold text-purple-300">{Object.keys(stats.imagesByType).length}</p>
                </div>
                <Image className="h-8 w-8 text-purple-400 opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Panel */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-6 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-blue-300">Upload Image</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Image Type</label>
                <select
                  value={selectedImageType}
                  onChange={(e) => setSelectedImageType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ct">CT Scan</option>
                  <option value="mri">MRI</option>
                  <option value="xray">X-Ray</option>
                  <option value="ultrasound">Ultrasound</option>
                  <option value="pet">PET Scan</option>
                  <option value="mammography">Mammography</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Clinical Indication</label>
                <textarea
                  value={clinicalIndication}
                  onChange={(e) => setClinicalIndication(e.target.value)}
                  placeholder="Describe the clinical reason for imaging"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                  rows={4}
                />
              </div>

              <Button
                onClick={() => {
                  if (patientId && clinicalIndication) {
                    uploadMutation.mutate({
                      patientId,
                      imageType: selectedImageType,
                      clinicalIndication,
                      imageUrl: "https://via.placeholder.com/512",
                    });
                  }
                }}
                disabled={uploadMutation.isPending || !patientId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
              </Button>

              {uploadMutation.data && (
                <div className="p-3 bg-green-900/20 rounded border border-green-500/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <p className="text-sm text-green-300">Image uploaded successfully</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Images List */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-300">Recent Images</h2>
            </div>

            {imagesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-700/30 p-4 rounded animate-pulse h-20" />
                ))}
              </div>
            ) : images && images.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {images.map((img) => (
                  <div key={img.id} className="bg-slate-800/50 p-4 rounded border border-slate-700/50 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-cyan-300">Patient: {img.patientId}</p>
                        <p className="text-sm text-slate-400">{img.imageType.toUpperCase()} - {img.bodyPart || "Full body"}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-900/40 text-purple-300 border border-purple-500/50 rounded text-xs font-semibold">
                        {new Date(img.studyDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{img.clinicalIndication}</p>
                    <Button
                      onClick={() => analyzeMutation.mutate({ medicalImageId: img.id })}
                      disabled={analyzeMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 text-sm"
                    >
                      {analyzeMutation.isPending ? "Analyzing..." : "Analyze with AI"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No images uploaded yet</p>
            )}
          </Card>
        </div>

        {/* Analysis Result */}
        {analyzeMutation.data && (
          <Card className="bg-slate-800/50 border-slate-700/50 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-6 w-6 text-green-400" />
              <h3 className="text-2xl font-bold text-green-300">Analysis Results</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Overall Risk Score</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold text-red-300">{analyzeMutation.data.analysis.overallRiskScore}%</p>
                  <p className="text-slate-400 mb-2">
                    {analyzeMutation.data.analysis.overallRiskScore > 70
                      ? "High Risk"
                      : analyzeMutation.data.analysis.overallRiskScore > 40
                      ? "Medium Risk"
                      : "Low Risk"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Follow-up Required</p>
                <div className="flex items-center gap-2">
                  {analyzeMutation.data.analysis.followUpRequired ? (
                    <>
                      <AlertTriangle className="h-6 w-6 text-orange-400" />
                      <span className="text-lg font-semibold text-orange-300">Yes - {analyzeMutation.data.analysis.followUpTimeframe}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                      <span className="text-lg font-semibold text-green-300">No Follow-up Needed</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {analyzeMutation.data.analysis.detectedAbnormalities?.length > 0 && (
              <div className="mt-4 p-4 bg-orange-900/20 rounded border border-orange-500/50">
                <p className="text-sm text-orange-300 font-semibold mb-2">Abnormalities Detected:</p>
                <ul className="text-sm text-slate-300 space-y-1">
                  {analyzeMutation.data.analysis.detectedAbnormalities.map((abnormality: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full" />
                      {typeof abnormality === "string" ? abnormality : JSON.stringify(abnormality)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analyzeMutation.data.analysis.clinicalSignificance && (
              <div className="mt-4 p-4 bg-slate-700/30 rounded border border-slate-600/50">
                <p className="text-sm text-slate-300 font-semibold mb-2">Clinical Significance:</p>
                <p className="text-sm text-slate-400">{analyzeMutation.data.analysis.clinicalSignificance}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
