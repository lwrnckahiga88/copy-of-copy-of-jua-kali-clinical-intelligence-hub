import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageMapping, getAllCategories } from "@/lib/pageMapping";
import { Link } from "wouter";
import { Microscope, ArrowLeft, ShieldCheck, Cpu, Database } from "lucide-react";

export default function AgentDirectory() {
  const categories = useMemo(() => getAllCategories(), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Microscope className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold gradient-text">Jua Kali Hub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
            </Button>
            <Button asChild variant="default" size="sm" className="bg-accent hover:bg-accent/90">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI Agent Directory</h1>
          <p className="text-xl text-muted-foreground">
            A comprehensive guide to all specialized AI agents within the Jua Kali Clinical Intelligence Hub.
            Each agent is meticulously designed to address specific healthcare challenges.
          </p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-accent">{category} Agents</h2>
              <div className="h-px flex-1 bg-accent/20"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pageMapping
                .filter((agent) => agent.category === category)
                .map((agent) => (
                  <Card key={agent.id} className="flex flex-col card-premium border-accent/10 bg-accent/5">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">{agent.name}</CardTitle>
                      <CardDescription className="text-muted-foreground text-base">{agent.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-accent/20 text-accent">{agent.category}</Badge>
                        <Badge variant="outline" className="border-accent/30">Cost: {agent.creditCost} Credits</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="text-foreground font-semibold">Clinical Validation:</span> This agent provides advanced capabilities in {agent.category.toLowerCase()}, offering sophisticated tools for {agent.description.toLowerCase()}.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Cpu className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="text-foreground font-semibold">AI Engine:</span> Leverages cutting-edge machine learning models to deliver precise results and support data-driven decision-making.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Database className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="text-foreground font-semibold">Data Integration:</span> Seamlessly integrates with existing clinical workflows to streamline research and diagnosis.
                          </p>
                        </div>
                      </div>

                      <Link href={`/dashboard?agent=${agent.id}`}>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11 mt-4">
                          Launch Agent
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/50">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Microscope className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg">Jua Kali Hub</span>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            AI-powered healthcare intelligence platform for clinical decision support and research.
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/showcase" className="hover:text-foreground transition-colors">Showcase</Link>
            <Link href="/agents" className="hover:text-foreground transition-colors">Directory</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-muted-foreground">&copy; 2026 Jua Kali Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
