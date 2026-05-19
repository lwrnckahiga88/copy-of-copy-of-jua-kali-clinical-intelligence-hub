import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Check, Zap, Shield, Microscope } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      credits: "100",
      description: "Perfect for exploring our AI agents",
      features: [
        "100 credits per month",
        "Access to basic agents",
        "Community support",
        "Standard performance",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      credits: "1000",
      description: "For active researchers and clinicians",
      features: [
        "1000 credits per month",
        "Access to all agents",
        "Priority support",
        "Advanced analytics",
        "API access",
        "Custom integrations",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      credits: "5000",
      description: "For healthcare institutions",
      features: [
        "5000 credits per month",
        "Unlimited agent access",
        "24/7 dedicated support",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "On-premise deployment",
        "SLA guarantee",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Microscope className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold gradient-text">Jua Kali Hub</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild variant="default">
                <a href="/dashboard">Dashboard</a>
              </Button>
            ) : (
              <Button asChild variant="default">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                AI-Powered Healthcare Intelligence
              </h1>
              <p className="text-xl text-muted-foreground">
                Access 55+ specialized AI agents for medical diagnosis, clinical validation, imaging analysis, drug discovery, and more. Powered by advanced machine learning and clinical expertise.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                    <a href={getLoginUrl()}>Get Started Free</a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="#pricing">View Pricing</a>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
              <div>
                <div className="text-3xl font-bold text-accent">55+</div>
                <div className="text-sm text-muted-foreground">AI Agents</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">10</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 border-t border-border/50">
        <div className="container">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-4xl font-bold mb-4">Why Choose Jua Kali Hub?</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive AI solutions for modern healthcare challenges
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Instant access to AI agents with real-time processing capabilities",
              },
              {
                icon: Shield,
                title: "Enterprise Secure",
                description: "HIPAA-compliant infrastructure with end-to-end encryption",
              },
              {
                icon: Microscope,
                title: "Clinical Grade",
                description: "Validated AI models built with clinical expertise",
              },
            ].map((feature, i) => (
              <div key={i} className="card-premium">
                <feature.icon className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 border-t border-border/50">
        <div className="container">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <Card
                key={i}
                className={`relative flex flex-col p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? "border-accent/50 ring-1 ring-accent/20 md:scale-105"
                    : "border-border/50"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="mt-2 text-sm text-accent font-semibold">
                    {tier.credits} credits included
                  </div>
                </div>

                <Button
                  asChild
                  className={`mb-8 ${
                    tier.highlighted
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                      : "border border-border hover:bg-card"
                  }`}
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>

                <div className="space-y-3 flex-1">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 p-8 card-premium max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-2">Need a custom plan?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our sales team for enterprise solutions tailored to your organization
            </p>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-t border-border/50">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-8 bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Healthcare?</h2>
              <p className="text-lg text-muted-foreground">
                Join healthcare professionals using Jua Kali Hub to make better clinical decisions
              </p>
            </div>
            {isAuthenticated ? (
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <a href={getLoginUrl()}>Start Free Trial</a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Microscope className="w-6 h-6 text-accent" />
                <span className="font-bold">Jua Kali Hub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered healthcare intelligence platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Agents</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Jua Kali Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
