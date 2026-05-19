import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageMapping, getAllCategories } from "@/lib/pageMapping";
import { Link } from "wouter";

export default function FeaturesShowcase() {
  const categories = useMemo(() => getAllCategories(), []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">Our Integrated AI Agents</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Explore the powerful AI agents integrated into the Jua Kali Clinical Intelligence Hub.
        Each agent is designed to provide specialized insights and tools for various healthcare domains.
      </p>

      {categories.map((category) => (
        <div key={category} className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 border-b pb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageMapping
              .filter((agent) => agent.category === category)
              .map((agent) => (
                <Card key={agent.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{agent.category}</Badge>
                      <Badge variant="outline">Cost: {agent.creditCost} Credits</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This agent provides advanced capabilities in {agent.category.toLowerCase()},
                      offering tools for {agent.description.toLowerCase()}.
                    </p>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Link href={`/dashboard?agent=${agent.id}`}>
                      <Button className="w-full">Launch Agent</Button>
                    </Link>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
