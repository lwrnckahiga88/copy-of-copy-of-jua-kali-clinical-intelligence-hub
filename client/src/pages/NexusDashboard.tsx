/**
 * NexusDashboard — Jarvis Agent Dashboard
 * Synced from lwrnckahiga88/juakali-jarvis-agents
 * Default category: medical-ai
 */
import JarvisAgentDashboard from "@/components/JarvisAgentDashboard";

export default function NexusDashboard() {
  return (
    <JarvisAgentDashboard
      defaultCategory="medical-ai"
      title="Nexus Dashboard"
      subtitle="All clinical AI modules — juA.kali hub"
      icon="🎯"
    />
  );
}
