/**
 * AgentDebate — Jarvis Agent Dashboard
 * Synced from lwrnckahiga88/juakali-jarvis-agents
 * Default category: clinical
 */
import JarvisAgentDashboard from "@/components/JarvisAgentDashboard";

export default function AgentDebate() {
  return (
    <JarvisAgentDashboard
      defaultCategory="clinical"
      title="Agent Debate"
      subtitle="Clinical validation, protocol review & multi-agent reasoning"
      icon="💬"
    />
  );
}
