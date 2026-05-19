import { invokeLLM } from "./_core/llm";

export interface AgentAnalysis {
  agentId: string;
  agentName: string;
  analysisType: "diagnosis" | "treatment" | "prognosis" | "risk_assessment";
  result: string;
  confidence: number; // 0-1
  timestamp: number;
}

export interface ConsensusScore {
  analysisType: string;
  agents: AgentAnalysis[];
  consensusResult: string;
  agreementScore: number; // 0-1
  confidenceLevel: "low" | "medium" | "high";
  recommendations: string[];
  clinicalSummary: string;
}

const CONSENSUS_THRESHOLDS = {
  high: 0.85,
  medium: 0.65,
  low: 0.0,
};

export async function calculateConsensusScore(
  analyses: AgentAnalysis[]
): Promise<ConsensusScore> {
  if (analyses.length === 0) {
    throw new Error("No analyses provided for consensus calculation");
  }

  const analysisType = analyses[0].analysisType;

  // Validate all analyses are of the same type
  if (!analyses.every((a) => a.analysisType === analysisType)) {
    throw new Error("All analyses must be of the same type");
  }

  // Calculate agreement score using LLM
  const agreementScore = await calculateAgreement(analyses);

  // Determine confidence level
  const confidenceLevel = getConfidenceLevel(agreementScore);

  // Generate consensus result
  const consensusResult = await generateConsensusResult(analyses, agreementScore);

  // Generate recommendations
  const recommendations = await generateRecommendations(analyses, consensusResult);

  // Generate clinical summary
  const clinicalSummary = await generateClinicalSummary(
    analyses,
    consensusResult,
    agreementScore
  );

  return {
    analysisType,
    agents: analyses,
    consensusResult,
    agreementScore,
    confidenceLevel,
    recommendations,
    clinicalSummary,
  };
}

async function calculateAgreement(analyses: AgentAnalysis[]): Promise<number> {
  if (analyses.length === 1) {
    return analyses[0].confidence;
  }

  // Use LLM to evaluate agreement between agent analyses
  const analysesText = analyses
    .map(
      (a) =>
        `${a.agentName} (confidence: ${a.confidence}): ${a.result}`
    )
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a medical consensus expert. Analyze the following AI agent analyses and provide an agreement score from 0 to 1, where:
- 1.0 = Complete agreement on diagnosis/treatment
- 0.8+ = Strong agreement with minor variations
- 0.6-0.8 = Moderate agreement with some differences
- 0.4-0.6 = Weak agreement with significant differences
- <0.4 = Poor agreement, conflicting conclusions

Respond with ONLY a JSON object: {"agreement_score": <number>, "reasoning": "<brief explanation>"}`,
      },
      {
        role: "user",
        content: `Analyze these agent analyses:\n${analysesText}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "agreement_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            agreement_score: { type: "number", minimum: 0, maximum: 1 },
            reasoning: { type: "string" },
          },
          required: ["agreement_score", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return Math.min(1, Math.max(0, parsed.agreement_score));
    }
  } catch (error) {
    console.error("[Consensus] Error parsing agreement score:", error);
  }

  // Fallback: calculate average confidence
  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
  return avgConfidence;
}

function getConfidenceLevel(agreementScore: number): "low" | "medium" | "high" {
  if (agreementScore >= CONSENSUS_THRESHOLDS.high) {
    return "high";
  } else if (agreementScore >= CONSENSUS_THRESHOLDS.medium) {
    return "medium";
  }
  return "low";
}

async function generateConsensusResult(
  analyses: AgentAnalysis[],
  agreementScore: number
): Promise<string> {
  const analysesText = analyses
    .map(
      (a) =>
        `${a.agentName}: ${a.result}`
    )
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a medical consensus expert. Based on multiple AI agent analyses, generate a concise consensus result. 
Consider the agreement level (${agreementScore.toFixed(2)}) and synthesize the findings into a single, clinically coherent statement.
If there are disagreements, highlight the key differences and note areas of uncertainty.`,
      },
      {
        role: "user",
        content: `Generate consensus from these analyses:\n${analysesText}`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Unable to generate consensus";
}

async function generateRecommendations(
  analyses: AgentAnalysis[],
  consensusResult: string
): Promise<string[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a clinical decision support expert. Based on the consensus analysis, generate 3-5 actionable clinical recommendations.
Format as a JSON array of strings. Each recommendation should be specific, evidence-based, and clinically relevant.`,
      },
      {
        role: "user",
        content: `Generate recommendations for this consensus result:\n${consensusResult}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 5,
            },
          },
          required: ["recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.recommendations || [];
    }
  } catch (error) {
    console.error("[Consensus] Error parsing recommendations:", error);
  }

  return ["Review consensus with clinical team", "Consider additional testing if indicated"];
}

async function generateClinicalSummary(
  analyses: AgentAnalysis[],
  consensusResult: string,
  agreementScore: number
): Promise<string> {
  const analysesText = analyses
    .map((a) => `${a.agentName}: ${a.result}`)
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a clinical documentation expert. Generate a comprehensive clinical summary that:
1. Synthesizes the multi-agent consensus
2. Notes the agreement level and confidence
3. Highlights any discrepancies between agents
4. Provides clinical context and implications
Keep it concise but thorough (150-300 words).`,
      },
      {
        role: "user",
        content: `Generate clinical summary for:
Agreement Score: ${agreementScore.toFixed(2)}
Consensus: ${consensusResult}
Individual Analyses:
${analysesText}`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Unable to generate clinical summary";
}

export async function validateConsensusThreshold(
  consensusScore: ConsensusScore,
  requiredConfidence: "low" | "medium" | "high" = "medium"
): Promise<boolean> {
  const threshold = CONSENSUS_THRESHOLDS[requiredConfidence];
  return consensusScore.agreementScore >= threshold;
}

export function formatConsensusForDisplay(consensus: ConsensusScore): Record<string, unknown> {
  return {
    type: consensus.analysisType,
    result: consensus.consensusResult,
    confidence: {
      level: consensus.confidenceLevel,
      score: (consensus.agreementScore * 100).toFixed(1) + "%",
    },
    agentCount: consensus.agents.length,
    agents: consensus.agents.map((a) => ({
      name: a.agentName,
      confidence: (a.confidence * 100).toFixed(1) + "%",
    })),
    recommendations: consensus.recommendations,
    summary: consensus.clinicalSummary,
  };
}
