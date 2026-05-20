/**
 * Comprehensive mapping of all AI agent modules
 */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  htmlFile: string;
  creditCost: number;
  icon?: string;
  externalUrl?: string;
  isEnterprise?: boolean;
}

export const AGENT_CATEGORIES = [
  "Medical AI",
  "Clinical Validation",
  "Epidemiology",
  "Imaging Analysis",
  "Genomics",
  "Drug Discovery",
  "Patient Management",
  "Research Tools",
  "Analytics",
  "Administrative",
  "Mental Health",
] as const;

export const pageMapping: AgentConfig[] = [
  // --- MEDICAL AI ---
  {
    id: "nurseai",
    name: "NurseAI",
    description: "Intelligent nursing assistant for patient care coordination",
    category: "Medical AI",
    htmlFile: "NurseAI.html",
    creditCost: 10,
    isEnterprise: true,
  },
  {
    id: "medos",
    name: "MedOs",
    description: "Advanced medical decision support for tertiary care",
    category: "Medical AI",
    htmlFile: "tertiary.html",
    creditCost: 15,
    isEnterprise: true,
  },
  {
    id: "interventionplanner",
    name: "Intervention Planner",
    description: "Clinical intervention scheduling and care coordination",
    category: "Medical AI",
    htmlFile: "intervention-planner.html",
    creditCost: 12,
    isEnterprise: true,
  },
  {
    id: "kemci",
    name: "K-EMCI",
    description: "Early mild cognitive impairment detection system",
    category: "Medical AI",
    htmlFile: "K-EMCI.html",
    creditCost: 8,
  },
  {
    id: "cardiax",
    name: "CardiaX",
    description: "Cardiovascular disease detection and risk stratification",
    category: "Medical AI",
    htmlFile: "cardiax.html",
    creditCost: 10,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/cardiax/",
  },

  // --- RESEARCH TOOLS ---
  {
    id: "quorumdeep",
    name: "QuorumDeep",
    description: "Deep learning consensus for complex clinical diagnoses",
    category: "Research Tools",
    htmlFile: "QuorumDeep.html",
    creditCost: 18,
    isEnterprise: true,
  },
  {
    id: "chemworkbench",
    name: "ChemWorkBench",
    description: "Molecular design and chemical analysis workbench",
    category: "Research Tools",
    htmlFile: "ChemWorkBench.html",
    creditCost: 20,
    isEnterprise: true,
  },
  {
    id: "secondaryanalysis",
    name: "Secondary Analysis",
    description: "Advanced genomic secondary analysis pipeline",
    category: "Research Tools",
    htmlFile: "secondary.html",
    creditCost: 15,
    isEnterprise: true,
  },
  {
    id: "newtonguardian",
    name: "Newton Guardian",
    description: "Hybrid Newtonian Genomics + Multi-Treatment Simulation",
    category: "Research Tools",
    htmlFile: "newton-guardian.html",
    creditCost: 25,
    isEnterprise: true,
  },
  {
    id: "tbr1neuroguardian",
    name: "TBR1 NeuroGuardian",
    description: "Advanced TBR1 neurodevelopmental analysis with GEO datasets",
    category: "Research Tools",
    htmlFile: "tbr1-neuroguardian.html",
    creditCost: 30,
    isEnterprise: true,
  },

  // --- MENTAL HEALTH ---
  {
    id: "clinicalneuroguardian",
    name: "Clinical NeuroGuardian",
    description: "Clinical-grade TBR1 monitoring for prevention & early detection",
    category: "Mental Health",
    htmlFile: "clinical-neuroguardian.html",
    creditCost: 20,
    isEnterprise: true,
  },

  // --- EPIDEMIOLOGY ---
  {
    id: "pandemicintelligence",
    name: "Pandemic Intelligence",
    description: "Real-time pandemic monitoring and predictive intelligence",
    category: "Epidemiology",
    htmlFile: "pandemic intelligence.html",
    creditCost: 15,
  },
  {
    id: "pandemicseird",
    name: "Pandemic SEIRD",
    description: "Advanced SEIRD modeling for infectious disease dynamics",
    category: "Epidemiology",
    htmlFile: "pandemic seird.html",
    creditCost: 12,
  },
  {
    id: "epidemiologyagent",
    name: "Epidemiology Agent",
    description: "Specialized agent for population health and disease tracking",
    category: "Epidemiology",
    htmlFile: "epidemiology.html",
    creditCost: 14,
  },

  // --- GENOMICS ---
  {
    id: "genomica",
    name: "Genomica",
    description: "Advanced genomic sequencing and variant analysis platform",
    category: "Genomics",
    htmlFile: "Genomica.html",
    creditCost: 20,
  },

  // --- IMAGING ANALYSIS ---
  {
    id: "oncoaipwav3",
    name: "OncoAI PWA v3",
    description: "Next-generation oncology imaging and diagnostic platform",
    category: "Imaging Analysis",
    htmlFile: "oncoai_pwa_v3.html",
    creditCost: 18,
  },

  // --- CLINICAL VALIDATION ---
  {
    id: "clinvalidai",
    name: "ClinValid AI",
    description: "AI-driven clinical validation and evidence-based assessment",
    category: "Clinical Validation",
    htmlFile: "clinValidAi.html",
    creditCost: 16,
  },
  {
    id: "clinicalvalidatorpro",
    name: "Clinical Validator Pro",
    description: "Professional workflow builder for clinical validation",
    category: "Clinical Validation",
    htmlFile: "clinical_validator_pro.html",
    creditCost: 22,
    isEnterprise: true,
  },
  {
    id: "pulmonix",
    name: "PulmonIX",
    description: "Respiratory disease analysis and lung function assessment",
    category: "Imaging Analysis",
    htmlFile: "pulmonix.html",
    creditCost: 9,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/pulmonary/",
  },

  // --- ADMINISTRATIVE ---
  {
    id: "studioosadmin",
    name: "StudioOS Admin",
    description: "Complete TPA administrative dashboard for StudioOS",
    category: "Administrative",
    htmlFile: "studio_os_admin.html",
    creditCost: 25,
  },
];

export function getAgentsByCategory(category: string): AgentConfig[] {
  return pageMapping.filter((agent) => agent.category === category);
}

export function getAgentById(id: string): AgentConfig | undefined {
  return pageMapping.find((agent) => agent.id === id);
}

export function searchAgents(query: string): AgentConfig[] {
  const lowerQuery = query.toLowerCase();
  return pageMapping.filter(
    (agent) =>
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery) ||
      agent.category.toLowerCase().includes(lowerQuery)
  );
}

export function getAllCategories(): string[] {
  return Array.from(new Set(pageMapping.map((agent) => agent.category)));
}
