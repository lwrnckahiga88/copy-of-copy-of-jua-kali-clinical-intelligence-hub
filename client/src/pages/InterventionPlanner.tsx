/**
 * InterventionPlanner — Jarvis Agent Dashboard
 * Synced from lwrnckahiga88/juakali-jarvis-agents
 * Default category: prediction
 */
import JarvisAgentDashboard from "@/components/JarvisAgentDashboard";

export default function InterventionPlanner() {
  return (
    <JarvisAgentDashboard
      defaultCategory="prediction"
      title="Intervention Planner"
      subtitle="Emergency care, K-EMCI & clinical decision support"
      icon="🚑"
    />
  );
}
