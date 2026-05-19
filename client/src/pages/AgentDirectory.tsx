import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageMapping, getAllCategories } from "@/lib/pageMapping";
import { Link } from "wouter";

export default function AgentDirectory() {
  const categories = useMemo(() => getAllCategories(), []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">Jua Kali AI Agent Directory</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        A comprehensive guide to all specialized AI agents within the Jua Kali Clinical Intelligence Hub.
        Each agent is meticulously designed to address specific healthcare challenges, offering advanced functionalities
        and insights to empower clinicians and researchers.
      </p>

      {categories.map((category) => (
        <div key={category} className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 border-b pb-2">{category} Agents</h2>
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
                    <p className="text-sm text-muted-foreground mb-4">
                      This agent provides advanced capabilities in **{agent.category}**,
                      offering sophisticated tools for **{agent.description.toLowerCase()}**.
                      It leverages cutting-edge machine learning models to deliver precise results,
                      streamline workflows, and support data-driven decision-making in its respective domain.
                    </p>
                    <Link href={`/dashboard?agent=${agent.id}`}>
                      <Button className="w-full">Launch Agent</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
