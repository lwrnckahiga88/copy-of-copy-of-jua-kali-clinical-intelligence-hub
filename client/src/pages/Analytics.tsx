/**
 * Analytics — Jarvis Agent Dashboard
 * Synced from lwrnckahiga88/juakali-jarvis-agents
 * Default category: pandemic
 */
import JarvisAgentDashboard from "@/components/JarvisAgentDashboard";

export default function Analytics() {
  return (
    <JarvisAgentDashboard
      defaultCategory="pandemic"
      title="Analytics"
      subtitle="Pandemic intelligence, SEIRD models & outbreak tracking"
      icon="📊"
    />
  );
}
