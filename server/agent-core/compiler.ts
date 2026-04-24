/**
 * Agent Graph Compiler
 * Converts GitHub HTML modules → typed JSON agent nodes (no DOM/jsdom needed)
 * Pure string analysis — zero runtime HTML parsing
 */

export type AgentCapability =
  | "submit-data"
  | "clinical-analysis"
  | "conversation"
  | "patient-routing"
  | "triage"
  | "oncology"
  | "outbreak"
  | "epidemic-analysis"
  | "imaging"
  | "vitals"
  | "prescription"
  | "lab-results"
  | "emergency"
  | "telemedicine";

export interface AgentNode {
  id: string;
  name: string;
  type: "ui-agent" | "compute-agent" | "swarm-agent";
  capabilities: AgentCapability[];
  source: "compiled-from-html" | "registry" | "dynamic";
  htmlUrl?: string;
  metadata: {
    compiledAt: number;
    contentHash: string;
  };
}

export interface GitHubFile {
  name: string;
  content?: string;
  download_url?: string;
  size?: number;
}

/**
 * Infer capabilities from HTML content without parsing the DOM
 * Uses keyword scanning — safe, fast, no jsdom dependency
 */
function inferCapabilities(html: string): AgentCapability[] {
  const caps = new Set<AgentCapability>();
  const lower = html.toLowerCase();

  if (lower.includes("submit") || lower.includes("form")) caps.add("submit-data");
  if (lower.includes("diagnosis") || lower.includes("diagnostic")) caps.add("clinical-analysis");
  if (lower.includes("chat") || lower.includes("message") || lower.includes("llm")) caps.add("conversation");
  if (lower.includes("patient") || lower.includes("triage")) caps.add("patient-routing");
  if (lower.includes("triage") || lower.includes("emergency")) caps.add("triage");
  if (lower.includes("onco") || lower.includes("cancer") || lower.includes("tumor")) caps.add("oncology");
  if (lower.includes("outbreak") || lower.includes("epidemic") || lower.includes("pandemic")) caps.add("outbreak");
  if (lower.includes("epidemic") || lower.includes("seird") || lower.includes("spread")) caps.add("epidemic-analysis");
  if (lower.includes("mri") || lower.includes("xray") || lower.includes("imaging") || lower.includes("scan")) caps.add("imaging");
  if (lower.includes("vital") || lower.includes("heartrate") || lower.includes("spo2") || lower.includes("bp")) caps.add("vitals");
  if (lower.includes("prescription") || lower.includes("medication") || lower.includes("drug")) caps.add("prescription");
  if (lower.includes("lab") || lower.includes("blood") || lower.includes("urine") || lower.includes("test result")) caps.add("lab-results");
  if (lower.includes("emergency") || lower.includes("911") || lower.includes("ambulance") || lower.includes("code blue")) caps.add("emergency");
  if (lower.includes("telehealth") || lower.includes("telemedicine") || lower.includes("remote consult")) caps.add("telemedicine");

  return Array.from(caps);
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < Math.min(str.length, 2000); i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, "0");
}

/**
 * Compile a list of GitHub file descriptors into an agent graph
 * Content is optional — if missing, capabilities are inferred from the filename
 */
export function compileRepoToAgentGraph(files: GitHubFile[]): AgentNode[] {
  const graph: AgentNode[] = [];

  for (const file of files) {
    if (!file.name.endsWith(".html")) continue;

    const id = file.name.replace(".html", "");
    const content = file.content ?? "";
    const capabilities = content
      ? inferCapabilities(content)
      : inferCapabilitiesFromName(id);

    graph.push({
      id,
      name: id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      type: "ui-agent",
      capabilities,
      source: "compiled-from-html",
      htmlUrl: file.download_url,
      metadata: {
        compiledAt: Date.now(),
        contentHash: simpleHash(content || id),
      },
    });
  }

  return graph;
}

/** Fallback: infer capabilities from filename when content is not fetched */
function inferCapabilitiesFromName(id: string): AgentCapability[] {
  const lower = id.toLowerCase();
  const caps = new Set<AgentCapability>();

  if (lower.includes("nurse") || lower.includes("triage")) caps.add("triage");
  if (lower.includes("onco") || lower.includes("cancer")) caps.add("oncology");
  if (lower.includes("pandemic") || lower.includes("epidemic")) caps.add("outbreak");
  if (lower.includes("imaging") || lower.includes("mri")) caps.add("imaging");
  if (lower.includes("vital")) caps.add("vitals");
  if (lower.includes("lab")) caps.add("lab-results");
  if (lower.includes("emergency")) caps.add("emergency");
  if (lower.includes("chat") || lower.includes("ai")) caps.add("conversation");
  if (lower.includes("patient")) caps.add("patient-routing");

  return Array.from(caps);
}
