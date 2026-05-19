/**
 * Comprehensive mapping of all 55+ AI agent modules
 * Each agent includes: id, name, description, category, htmlFile, and creditCost
 * 
 * Local HTML files are in /client/public/agents/
 * External URLs are for PWA repositories that load in iframes
 */

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  htmlFile: string;
  creditCost: number;
  icon?: string;
  externalUrl?: string; // External PWA URL (fallback if local doesn't exist)
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
] as const;

export const pageMapping: AgentConfig[] = [
  // Medical AI Category
  {
    id: "nursai",
    name: "NurseAI",
    description: "Intelligent nursing assistant for patient care coordination and clinical decision support",
    category: "Medical AI",
    htmlFile: "NurseAI.html",
    creditCost: 5,
  },
  {
    id: "medos",
    name: "Medos",
    description: "Advanced medical decision support system for tertiary care",
    category: "Medical AI",
    htmlFile: "tertiary.html",
    creditCost: 12,
  },
  {
    id: "k-emci",
    name: "K-EMCI",
    description: "Early mild cognitive impairment detection and monitoring system",
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
  {
    id: "hepatix",
    name: "HepatIX",
    description: "Liver disease diagnosis and hepatic function monitoring",
    category: "Medical AI",
    htmlFile: "hepatix.html",
    creditCost: 8,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/hepatix/",
  },

  // Clinical Validation Category
  {
    id: "quorumdeep",
    name: "QuorumDeep",
    description: "Deep learning consensus system for complex clinical diagnoses",
    category: "Clinical Validation",
    htmlFile: "QuorumDeep.html",
    creditCost: 12,
  },
  {
    id: "clinicalvalidator",
    name: "Clinical Validator",
    description: "Evidence-based clinical trial validation and protocol review",
    category: "Clinical Validation",
    htmlFile: "clinValidAi.html",
    creditCost: 15,
  },
  {
    id: "evidencesynthesis",
    name: "Evidence Synthesis",
    description: "Systematic review and meta-analysis aggregation platform",
    category: "Clinical Validation",
    htmlFile: "evidencesynthesis.html",
    creditCost: 12,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/evidence-synthesis/",
  },
  {
    id: "rctanalyzer",
    name: "RCT Analyzer",
    description: "Randomized controlled trial design and analysis tool",
    category: "Clinical Validation",
    htmlFile: "rctanalyzer.html",
    creditCost: 14,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/rct-analyzer/",
  },

  // Epidemiology Category
  {
    id: "epidemiologyengine",
    name: "Epidemiology Engine",
    description: "Disease outbreak detection and epidemiological modeling",
    category: "Epidemiology",
    htmlFile: "pandemic-intelligence.html",
    creditCost: 10,
    externalUrl: "https://lwnckaiga88.github.io/health-ai/pandemic-intelligence.html",
  },
  {
    id: "diseasetracker",
    name: "Disease Tracker",
    description: "Real-time disease surveillance and tracking system",
    category: "Epidemiology",
    htmlFile: "pandemic-intelligence.html",
    creditCost: 8,
    externalUrl: "https://lwnckaiga88.github.io/health-ai/pandemic-intelligence.html",
  },
  {
    id: "riskmodeler",
    name: "Risk Modeler",
    description: "Population health risk assessment and prediction",
    category: "Epidemiology",
    htmlFile: "pandemic-seird.html",
    creditCost: 9,
    externalUrl: "https://lwnckaiga88.github.io/health-ai/pandemic-seird.html",
  },

  // Imaging Analysis Category
  {
    id: "radiomics",
    name: "Radiomics",
    description: "Advanced radiological image analysis and feature extraction",
    category: "Imaging Analysis",
    htmlFile: "radiomics.html",
    creditCost: 13,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/radiomics/",
  },
  {
    id: "pathologyai",
    name: "PathologyAI",
    description: "Digital pathology image analysis and diagnosis support",
    category: "Imaging Analysis",
    htmlFile: "pathologyai.html",
    creditCost: 12,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/pathology/",
  },
  {
    id: "ultrasoundpro",
    name: "UltrasoundPro",
    description: "Ultrasound image interpretation and quality assessment",
    category: "Imaging Analysis",
    htmlFile: "ultrasoundpro.html",
    creditCost: 10,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/ultrasound/",
  },
  {
    id: "mrianalyzer",
    name: "MRI Analyzer",
    description: "Magnetic resonance imaging analysis and segmentation",
    category: "Imaging Analysis",
    htmlFile: "mrianalyzer.html",
    creditCost: 11,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/mri/",
  },
  {
    id: "ctscanner",
    name: "CT Scanner",
    description: "Computed tomography image analysis and 3D reconstruction",
    category: "Imaging Analysis",
    htmlFile: "ctscanner.html",
    creditCost: 11,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/ct/",
  },

  // Genomics Category
  {
    id: "genomica",
    name: "Genomica",
    description: "Advanced genomic analysis and interpretation for personalized medicine",
    category: "Genomics",
    htmlFile: "Genomica.html",
    creditCost: 10,
  },
  {
    id: "sequenceanalysis",
    name: "Sequence Analysis",
    description: "DNA/RNA sequence alignment and variant calling",
    category: "Genomics",
    htmlFile: "secondary.html",
    creditCost: 12,
    externalUrl: "https://lwnckaiga88.github.io/copy-of-jua-kali-innovation-platform/secondary.html",
  },
  {
    id: "proteinfolding",
    name: "Protein Folding",
    description: "3D protein structure prediction and analysis",
    category: "Genomics",
    htmlFile: "secondary.html",
    creditCost: 15,
    externalUrl: "https://lwnckaiga88.github.io/copy-of-jua-kali-innovation-platform/secondary.html",
  },
  {
    id: "geneticscreening",
    name: "Genetic Screening",
    description: "Inherited disease and genetic risk assessment",
    category: "Genomics",
    htmlFile: "secondary.html",
    creditCost: 10,
    externalUrl: "https://lwnckaiga88.github.io/copy-of-jua-kali-innovation-platform/secondary.html",
  },

  // Drug Discovery Category
  {
    id: "chemworkbench",
    name: "ChemWorkbench",
    description: "Molecular chemistry and drug compound analysis platform",
    category: "Drug Discovery",
    htmlFile: "chemworkbench.html",
    creditCost: 15,
    externalUrl: "https://lwnckaiga88.github.io/health-ai/chemworkbench.html",
  },
  {
    id: "moleculardesign",
    name: "Molecular Design",
    description: "De novo drug molecule design and optimization",
    category: "Drug Discovery",
    htmlFile: "tertiary.html",
    creditCost: 18,
    externalUrl: "https://lwnckaiga88.github.io/copy-of-jua-kali-innovation-platform/tertiary.html",
  },
  {
    id: "dockingengine",
    name: "Docking Engine",
    description: "Molecular docking and binding affinity prediction",
    category: "Drug Discovery",
    htmlFile: "tertiary.html",
    creditCost: 16,
    externalUrl: "https://lwnckaiga88.github.io/copy-of-jua-kali-innovation-platform/tertiary.html",
  },
  {
    id: "admetpredictor",
    name: "ADMET Predictor",
    description: "Absorption, distribution, metabolism, excretion prediction",
    category: "Drug Discovery",
    htmlFile: "tertiary.html",
    creditCost: 14,
    externalUrl: "https://lwnckaiga88.github.io/copy-of-jua-kali-innovation-platform/tertiary.html",
  },
  {
    id: "toxicityscreen",
    name: "Toxicity Screen",
    description: "Drug toxicity and safety profile assessment",
    category: "Drug Discovery",
    htmlFile: "tertiary.html",
    creditCost: 12,
    externalUrl: "https://lwnckaiga88.github.io/copy-of-jua-kali-innovation-platform/tertiary.html",
  },

  // Patient Management Category
  {
    id: "patientportal",
    name: "Patient Portal",
    description: "Secure patient health records and communication hub",
    category: "Patient Management",
    htmlFile: "patientportal.html",
    creditCost: 3,
  },
  {
    id: "appointmentscheduler",
    name: "Appointment Scheduler",
    description: "Intelligent appointment booking and optimization",
    category: "Patient Management",
    htmlFile: "appointmentscheduler.html",
    creditCost: 2,
  },
  {
    id: "medicationmanager",
    name: "Medication Manager",
    description: "Prescription management and drug interaction checker",
    category: "Patient Management",
    htmlFile: "medicationmanager.html",
    creditCost: 4,
  },
  {
    id: "vitalsmonitor",
    name: "Vitals Monitor",
    description: "Continuous vital signs monitoring and alerts",
    category: "Patient Management",
    htmlFile: "vitalsmonitor.html",
    creditCost: 5,
  },

  // Research Tools Category
  {
    id: "literatureminer",
    name: "Literature Miner",
    description: "Biomedical literature search and knowledge extraction",
    category: "Research Tools",
    htmlFile: "literatureminer.html",
    creditCost: 7,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/literature/",
  },
  {
    id: "dataintegration",
    name: "Data Integration",
    description: "Multi-source healthcare data harmonization and integration",
    category: "Research Tools",
    htmlFile: "dataintegration.html",
    creditCost: 9,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/data-integration/",
  },
  {
    id: "statisticalanalysis",
    name: "Statistical Analysis",
    description: "Advanced biostatistics and hypothesis testing",
    category: "Research Tools",
    htmlFile: "statisticalanalysis.html",
    creditCost: 8,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/statistics/",
  },
  {
    id: "experimentdesigner",
    name: "Experiment Designer",
    description: "Research protocol design and sample size calculation",
    category: "Research Tools",
    htmlFile: "experimentdesigner.html",
    creditCost: 6,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/experiment/",
  },

  // Analytics Category
  {
    id: "dashboardbuilder",
    name: "Dashboard Builder",
    description: "Custom healthcare analytics dashboard creation",
    category: "Analytics",
    htmlFile: "dashboardbuilder.html",
    creditCost: 6,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/dashboard/",
  },
  {
    id: "predictiveanalytics",
    name: "Predictive Analytics",
    description: "Patient outcome prediction and risk stratification",
    category: "Analytics",
    htmlFile: "predictiveanalytics.html",
    creditCost: 11,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/predictive/",
  },
  {
    id: "qualitymetrics",
    name: "Quality Metrics",
    description: "Healthcare quality and performance measurement",
    category: "Analytics",
    htmlFile: "qualitymetrics.html",
    creditCost: 5,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/quality/",
  },
  {
    id: "costanalysis",
    name: "Cost Analysis",
    description: "Healthcare cost and resource utilization analysis",
    category: "Analytics",
    htmlFile: "costanalysis.html",
    creditCost: 7,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/cost/",
  },

  // Administrative Category
  {
    id: "staffscheduler",
    name: "Staff Scheduler",
    description: "Intelligent healthcare workforce scheduling",
    category: "Administrative",
    htmlFile: "staffscheduler.html",
    creditCost: 4,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/staff/",
  },
  {
    id: "inventorymanager",
    name: "Inventory Manager",
    description: "Medical supplies and equipment inventory tracking",
    category: "Administrative",
    htmlFile: "inventorymanager.html",
    creditCost: 3,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/inventory/",
  },
  {
    id: "billingengine",
    name: "Billing Engine",
    description: "Healthcare billing and revenue cycle management",
    category: "Administrative",
    htmlFile: "billingengine.html",
    creditCost: 5,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/billing/",
  },
  {
    id: "compliancetracker",
    name: "Compliance Tracker",
    description: "Healthcare compliance and regulatory monitoring",
    category: "Administrative",
    htmlFile: "compliancetracker.html",
    creditCost: 6,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/compliance/",
  },
  {
    id: "reportgenerator",
    name: "Report Generator",
    description: "Automated healthcare report generation and distribution",
    category: "Administrative",
    htmlFile: "reportgenerator.html",
    creditCost: 4,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/reports/",
  },

  // Additional Imaging Agents from OncoAI PWA
  {
    id: "pulmonix",
    name: "PulmonIX",
    description: "Respiratory disease analysis and lung function assessment",
    category: "Imaging Analysis",
    htmlFile: "pulmonix.html",
    creditCost: 9,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/pulmonary/",
  },
  {
    id: "neurox",
    name: "NeuroX",
    description: "Neurological disorder detection and brain imaging analysis",
    category: "Imaging Analysis",
    htmlFile: "neurox.html",
    creditCost: 11,
    externalUrl: "https://lwnckaiga88.github.io/oncoai/neuro/",
  },
];

/**
 * Helper function to get agents by category
 */
export function getAgentsByCategory(category: string): AgentConfig[] {
  return pageMapping.filter((agent) => agent.category === category);
}

/**
 * Helper function to get agent by ID
 */
export function getAgentById(id: string): AgentConfig | undefined {
  return pageMapping.find((agent) => agent.id === id);
}

/**
 * Helper function to search agents
 */
export function searchAgents(query: string): AgentConfig[] {
  const lowerQuery = query.toLowerCase();
  return pageMapping.filter(
    (agent) =>
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery) ||
      agent.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(pageMapping.map((agent) => agent.category)));
}
