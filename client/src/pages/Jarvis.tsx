import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, GitBranch, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Jarvis Panel — Intent Routing Engine UI
 * Displays repo sync status, available pages, and actor execution controls
 */
export default function Jarvis() {
  const { user, isAuthenticated } = useAuth();
  const [forceRefresh, setForceRefresh] = useState(false);

  // Fetch repo sync data
  const { data: repoData, isLoading: repoLoading, refetch: refetchRepo } = trpc.jarvis.getRepoSync.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch system status
  const { data: statusData, isLoading: statusLoading } = trpc.jarvis.statusCheck.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleRefreshRepo = async () => {
    setForceRefresh(true);
    try {
      await refetchRepo();
      toast.success("Repository synced successfully");
    } catch (error) {
      toast.error("Failed to sync repository");
    } finally {
      setForceRefresh(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Jarvis — Intent Router</CardTitle>
            <CardDescription>Authentication required</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please sign in to access the Jarvis intent routing engine.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Jarvis</h1>
          <p className="text-muted-foreground">
            Intent routing engine bridging StudioOS, UI compiler, and Apify execution layer
          </p>
        </div>

        {/* System Status */}
        <Card className="border-cyan-500/20 bg-cyan-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading status...</span>
              </div>
            ) : statusData?.success ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Jarvis</p>
                  <Badge variant="outline" className="bg-green-950/30 text-green-400 border-green-500/30">
                    {(statusData as any)?.data?.jarvis || "online"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">StudioOS</p>
                  <Badge variant="outline" className="bg-purple-950/30 text-purple-400 border-purple-500/30">
                    {(statusData as any)?.data?.studioOS || "operational"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Apify</p>
                  <Badge variant="outline" className="bg-pink-950/30 text-pink-400 border-pink-500/30">
                    {(statusData as any)?.data?.apify || "connected"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-400">Failed to load status</p>
            )}
          </CardContent>
        </Card>

        {/* Repo Sync Panel */}
        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pages">Repository Pages</TabsTrigger>
            <TabsTrigger value="stats">Sync Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    lwrnckahiga88/jua.manus
                  </CardTitle>
                  <CardDescription>
                    HTML pages tracked in the GitHub repository
                  </CardDescription>
                </div>
                <Button
                  onClick={handleRefreshRepo}
                  disabled={repoLoading || forceRefresh}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${repoLoading || forceRefresh ? "animate-spin" : ""}`} />
                  Sync
                </Button>
              </CardHeader>
              <CardContent>
                {repoLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  </div>
                ) : repoData?.success && (repoData as any)?.data?.pages ? (
                  <div className="space-y-3">
                    {(repoData as any).data.pages.length > 0 ? (
                      (repoData as any).data.pages.map((page: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-cyan-500/30 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-foreground">
                                {page.name}
                              </span>
                              {page.inPlatform ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {page.path} • {(page.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                page.inPlatform
                                  ? "bg-green-950/30 text-green-400 border-green-500/30"
                                  : "bg-yellow-950/30 text-yellow-400 border-yellow-500/30"
                              }
                            >
                              {page.inPlatform ? "Platform" : "Repo Only"}
                            </Badge>
                            <a
                              href={page.rawUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No pages found in repository
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-400">
                      {repoData?.error || "Failed to fetch repository data"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Synchronization Statistics</CardTitle>
                <CardDescription>
                  Repository sync metrics and page inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {repoData?.success && (repoData as any)?.data?.stats ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-border/50 bg-background/50">
                      <p className="text-xs text-muted-foreground mb-1">Total Pages</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {(repoData as any).data.stats.total}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border/50 bg-background/50">
                      <p className="text-xs text-muted-foreground mb-1">In Platform</p>
                      <p className="text-2xl font-bold text-green-400">
                        {(repoData as any).data.stats.inPlatform}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border/50 bg-background/50">
                      <p className="text-xs text-muted-foreground mb-1">Unregistered</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {(repoData as any).data.stats.unregistered}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sync data unavailable
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Info */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Current Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">User: </span>
              <span className="font-mono text-foreground">{user?.name || user?.email}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Role: </span>
              <Badge variant="outline" className="ml-2">
                {user?.role || "user"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
