/**
 * Multi-Cancer & Blood Disorder Analysis Module
 * Comprehensive biomarker analysis for all cancer types and blood disorders
 * Integrates with all medical AI agents for clinical decision support
 */

import { invokeLLM } from './_core/llm';

// ============================================================================
// CANCER TYPE DEFINITIONS & BIOMARKERS
// ============================================================================

export type CancerType =
  | 'breast'
  | 'lung'
  | 'colorectal'
  | 'ovarian'
  | 'pancreatic'
  | 'prostate'
  | 'melanoma'
  | 'lymphoma'
  | 'leukemia'
  | 'renal'
  | 'bladder'
  | 'gastric';

export type BloodDisorderType =
  | 'hemophilia_a'
  | 'hemophilia_b'
  | 'sickle_cell'
  | 'thalassemia'
  | 'von_willebrand'
  | 'thrombophilia'
  | 'aplastic_anemia'
  | 'myelodysplastic';

export interface BiomarkerProfile {
  gene: string;
  mutation: string;
  frequency: number; // percentage in population
  prognostic: 'favorable' | 'unfavorable' | 'neutral';
  predictive: boolean;
  targetedTherapies: string[];
  clinicalSignificance: string;
}

export interface CancerProfile {
  cancerType: CancerType;
  stage: string; // I, II, III, IV
  grade: string; // 1-4 (histological grade)
  histology: string;
  biomarkers: BiomarkerProfile[];
  mutationBurden: number; // TMB - mutations per megabase
  microsatelliteInstability: boolean;
  tumorMutationalBurden: 'low' | 'intermediate' | 'high';
  neoantigenLoad: number;
  immuneInfiltration: 'cold' | 'warm' | 'hot';
  estimatedSurvival: {
    oneYear: number; // percentage
    threeYear: number;
    fiveYear: number;
  };
}

export interface BloodDisorderProfile {
  disorderType: BloodDisorderType;
  severity: 'mild' | 'moderate' | 'severe';
  geneticBasis: string;
  affectedGenes: string[];
  inheritancePattern: 'autosomal_dominant' | 'autosomal_recessive' | 'x_linked';
  clottingFactorLevels: Record<string, number>;
  bleedingRiskScore: number; // 0-100
  thrombosisRiskScore: number; // 0-100
  managementStrategy: string[];
}

export interface TreatmentRecommendation {
  treatmentName: string;
  category: 'targeted' | 'immunotherapy' | 'chemotherapy' | 'hormonal' | 'supportive';
  efficacyScore: number; // 0-100
  toxicityScore: number; // 0-100
  clinicalEvidence: string;
  contraindications: string[];
  monitoringRequirements: string[];
  estimatedResponse: number; // percentage
}

// ============================================================================
// CANCER BIOMARKER DATABASE
// ============================================================================

const CANCER_BIOMARKERS: Record<CancerType, BiomarkerProfile[]> = {
  breast: [
    {
      gene: 'BRCA1',
      mutation: 'Loss of function',
      frequency: 5,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Olaparib', 'Talazoparib', 'Rucaparib'],
      clinicalSignificance: 'Predicts PARP inhibitor response; associated with TNBC',
    },
    {
      gene: 'BRCA2',
      mutation: 'Loss of function',
      frequency: 3,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Olaparib', 'Talazoparib'],
      clinicalSignificance: 'Similar to BRCA1; DNA repair deficiency',
    },
    {
      gene: 'HER2',
      mutation: 'Amplification',
      frequency: 15,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Trastuzumab', 'Pertuzumab', 'T-DM1', 'Lapatinib'],
      clinicalSignificance: 'Mutually exclusive with BRCA1; defines HER2-enriched subtype',
    },
    {
      gene: 'ER',
      mutation: 'Positive',
      frequency: 70,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Tamoxifen', 'Aromatase Inhibitors', 'Fulvestrant'],
      clinicalSignificance: 'Hormone receptor status; predicts endocrine therapy response',
    },
    {
      gene: 'PR',
      mutation: 'Positive',
      frequency: 65,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Tamoxifen', 'Aromatase Inhibitors'],
      clinicalSignificance: 'Progesterone receptor; supports endocrine therapy',
    },
    {
      gene: 'TP53',
      mutation: 'Missense/LOF',
      frequency: 80,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: ['MDM2 inhibitors (experimental)'],
      clinicalSignificance: 'Most common mutation; associated with aggressive phenotype',
    },
    {
      gene: 'PIK3CA',
      mutation: 'Activating',
      frequency: 40,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['PI3K inhibitors', 'mTOR inhibitors'],
      clinicalSignificance: 'Frequent in HR+ breast cancer; PI3K pathway activation',
    },
  ],
  lung: [
    {
      gene: 'EGFR',
      mutation: 'Exon 19 deletion / L858R',
      frequency: 15,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Erlotinib', 'Gefitinib', 'Afatinib', 'Osimertinib'],
      clinicalSignificance: 'Most common driver mutation in adenocarcinoma; TKI sensitive',
    },
    {
      gene: 'ALK',
      mutation: 'Translocation',
      frequency: 5,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Crizotinib', 'Alectinib', 'Brigatinib'],
      clinicalSignificance: 'ALK fusion; responds to ALK inhibitors',
    },
    {
      gene: 'KRAS',
      mutation: 'G12C',
      frequency: 13,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Sotorasib', 'Adagrasib'],
      clinicalSignificance: 'KRAS G12C mutation; now targetable with covalent inhibitors',
    },
    {
      gene: 'ROS1',
      mutation: 'Translocation',
      frequency: 1,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Crizotinib', 'Entrectinib', 'Lorlatinib'],
      clinicalSignificance: 'ROS1 fusion; responds to tyrosine kinase inhibitors',
    },
    {
      gene: 'BRAF',
      mutation: 'V600E',
      frequency: 2,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Dabrafenib', 'Vemurafenib'],
      clinicalSignificance: 'BRAF V600E; MAPK pathway activation',
    },
    {
      gene: 'MET',
      mutation: 'Exon 14 skipping',
      frequency: 3,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Tepotinib', 'Capmatinib'],
      clinicalSignificance: 'MET exon 14 skipping; MET inhibitor sensitive',
    },
    {
      gene: 'PD-L1',
      mutation: 'High expression',
      frequency: 40,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['Pembrolizumab', 'Nivolumab', 'Atezolizumab'],
      clinicalSignificance: 'PD-L1 expression; predicts checkpoint inhibitor response',
    },
  ],
  colorectal: [
    {
      gene: 'KRAS',
      mutation: 'Activating',
      frequency: 40,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Sotorasib (G12C)', 'Cetuximab (wild-type only)'],
      clinicalSignificance: 'KRAS mutation; predicts resistance to EGFR inhibitors',
    },
    {
      gene: 'BRAF',
      mutation: 'V600E',
      frequency: 10,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Encorafenib', 'Binimetinib'],
      clinicalSignificance: 'BRAF V600E; associated with MSI-H and poor prognosis',
    },
    {
      gene: 'MSI',
      mutation: 'Microsatellite Instability',
      frequency: 15,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Pembrolizumab', 'Nivolumab', 'Ipilimumab'],
      clinicalSignificance: 'MSI-H; predicts immunotherapy response',
    },
    {
      gene: 'EGFR',
      mutation: 'Wild-type',
      frequency: 60,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['Cetuximab', 'Panitumumab'],
      clinicalSignificance: 'EGFR wild-type required for EGFR inhibitor response',
    },
    {
      gene: 'TP53',
      mutation: 'Missense/LOF',
      frequency: 50,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'Tumor suppressor; associated with aggressive disease',
    },
  ],
  ovarian: [
    {
      gene: 'BRCA1',
      mutation: 'Loss of function',
      frequency: 10,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Olaparib', 'Rucaparib', 'Niraparib'],
      clinicalSignificance: 'BRCA1 mutation; PARP inhibitor sensitive',
    },
    {
      gene: 'BRCA2',
      mutation: 'Loss of function',
      frequency: 8,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Olaparib', 'Rucaparib'],
      clinicalSignificance: 'BRCA2 mutation; DNA repair deficiency',
    },
    {
      gene: 'HRD',
      mutation: 'Homologous Recombination Deficiency',
      frequency: 50,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['PARP inhibitors'],
      clinicalSignificance: 'HRD status; predicts PARP inhibitor response',
    },
    {
      gene: 'TP53',
      mutation: 'Missense/LOF',
      frequency: 96,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'Nearly universal in high-grade serous ovarian cancer',
    },
  ],
  pancreatic: [
    {
      gene: 'KRAS',
      mutation: 'Activating',
      frequency: 90,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Sotorasib (G12C)', 'Combination therapies'],
      clinicalSignificance: 'Nearly universal; KRAS G12C now targetable',
    },
    {
      gene: 'TP53',
      mutation: 'Missense/LOF',
      frequency: 70,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'Tumor suppressor; associated with aggressive phenotype',
    },
    {
      gene: 'BRCA1/2',
      mutation: 'Loss of function',
      frequency: 10,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Olaparib', 'Platinum-based chemotherapy'],
      clinicalSignificance: 'BRCA mutations; platinum and PARP inhibitor sensitive',
    },
    {
      gene: 'CDKN2A',
      mutation: 'Loss of function',
      frequency: 95,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'p16 loss; cell cycle checkpoint disruption',
    },
  ],
  prostate: [
    {
      gene: 'AR',
      mutation: 'Amplification/Mutation',
      frequency: 50,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Enzalutamide', 'Abiraterone', 'Apalutamide'],
      clinicalSignificance: 'Androgen receptor; predicts hormone therapy response',
    },
    {
      gene: 'PTEN',
      mutation: 'Loss of function',
      frequency: 25,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: ['PI3K/mTOR inhibitors'],
      clinicalSignificance: 'PTEN loss; PI3K pathway activation',
    },
    {
      gene: 'TP53',
      mutation: 'Missense/LOF',
      frequency: 20,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'Tumor suppressor; associated with aggressive disease',
    },
    {
      gene: 'BRCA2',
      mutation: 'Loss of function',
      frequency: 5,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['PARP inhibitors', 'Platinum-based chemotherapy'],
      clinicalSignificance: 'BRCA2 mutation; PARP inhibitor sensitive',
    },
  ],
  melanoma: [
    {
      gene: 'BRAF',
      mutation: 'V600E',
      frequency: 50,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Dabrafenib', 'Vemurafenib', 'Encorafenib'],
      clinicalSignificance: 'BRAF V600E; MAPK pathway activation',
    },
    {
      gene: 'NRAS',
      mutation: 'Q61R/K/L',
      frequency: 20,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['MEK inhibitors', 'Combination MAPK inhibitors'],
      clinicalSignificance: 'NRAS mutation; RAS pathway activation',
    },
    {
      gene: 'KIT',
      mutation: 'Activating',
      frequency: 5,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Imatinib', 'Sunitinib'],
      clinicalSignificance: 'KIT mutation; tyrosine kinase inhibitor sensitive',
    },
    {
      gene: 'PD-L1',
      mutation: 'High expression',
      frequency: 40,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['Pembrolizumab', 'Nivolumab', 'Ipilimumab'],
      clinicalSignificance: 'PD-L1 expression; checkpoint inhibitor sensitive',
    },
  ],
  lymphoma: [
    {
      gene: 'CD20',
      mutation: 'Positive',
      frequency: 95,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Rituximab', 'Obinutuzumab', 'Ofatumumab'],
      clinicalSignificance: 'B-cell marker; CD20-targeted monoclonal antibodies',
    },
    {
      gene: 'BCL2',
      mutation: 'Translocation t(14;18)',
      frequency: 85,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Venetoclax', 'BCL2 inhibitors'],
      clinicalSignificance: 'BCL2 translocation; apoptosis evasion',
    },
    {
      gene: 'MYC',
      mutation: 'Translocation',
      frequency: 10,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: ['Intensive chemotherapy'],
      clinicalSignificance: 'MYC translocation; Burkitt lymphoma marker',
    },
    {
      gene: 'PD-L1',
      mutation: 'High expression',
      frequency: 30,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['Nivolumab', 'Pembrolizumab'],
      clinicalSignificance: 'Checkpoint ligand; immunotherapy sensitive',
    },
  ],
  leukemia: [
    {
      gene: 'BCR-ABL',
      mutation: 'Translocation t(9;22)',
      frequency: 95,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Imatinib', 'Dasatinib', 'Nilotinib', 'Bosutinib'],
      clinicalSignificance: 'Philadelphia chromosome; tyrosine kinase inhibitor sensitive',
    },
    {
      gene: 'FLT3',
      mutation: 'ITD/TKD',
      frequency: 30,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Midostaurin', 'Sorafenib', 'Crenolanib'],
      clinicalSignificance: 'FLT3 mutation; tyrosine kinase inhibitor sensitive',
    },
    {
      gene: 'NPM1',
      mutation: 'Mutation',
      frequency: 35,
      prognostic: 'favorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'NPM1 mutation; favorable prognosis in AML',
    },
    {
      gene: 'CEBPA',
      mutation: 'Biallelic mutation',
      frequency: 10,
      prognostic: 'favorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'CEBPA mutation; favorable prognosis',
    },
  ],
  renal: [
    {
      gene: 'VHL',
      mutation: 'Loss of function',
      frequency: 80,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['VEGF inhibitors', 'mTOR inhibitors', 'HIF-2α inhibitors'],
      clinicalSignificance: 'VHL loss; HIF pathway activation; VEGF-dependent',
    },
    {
      gene: 'PBRM1',
      mutation: 'Loss of function',
      frequency: 40,
      prognostic: 'favorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'PBRM1 loss; chromatin remodeling deficiency',
    },
    {
      gene: 'BAP1',
      mutation: 'Loss of function',
      frequency: 15,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'BAP1 loss; poor prognosis',
    },
    {
      gene: 'PD-L1',
      mutation: 'High expression',
      frequency: 30,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['Nivolumab', 'Pembrolizumab', 'Atezolizumab'],
      clinicalSignificance: 'Checkpoint ligand; immunotherapy sensitive',
    },
  ],
  bladder: [
    {
      gene: 'TP53',
      mutation: 'Missense/LOF',
      frequency: 50,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'Tumor suppressor; associated with muscle-invasive disease',
    },
    {
      gene: 'RB1',
      mutation: 'Loss of function',
      frequency: 40,
      prognostic: 'unfavorable',
      predictive: false,
      targetedTherapies: [],
      clinicalSignificance: 'RB loss; cell cycle checkpoint disruption',
    },
    {
      gene: 'FGFR3',
      mutation: 'Activating',
      frequency: 60,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Erdafitinib', 'Infigratinib'],
      clinicalSignificance: 'FGFR3 mutation; FGFR inhibitor sensitive',
    },
    {
      gene: 'PD-L1',
      mutation: 'High expression',
      frequency: 50,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['Pembrolizumab', 'Atezolizumab', 'Nivolumab'],
      clinicalSignificance: 'Checkpoint ligand; immunotherapy sensitive',
    },
  ],
  gastric: [
    {
      gene: 'HER2',
      mutation: 'Amplification',
      frequency: 20,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Trastuzumab', 'Pertuzumab'],
      clinicalSignificance: 'HER2 amplification; trastuzumab sensitive',
    },
    {
      gene: 'EGFR',
      mutation: 'Overexpression',
      frequency: 30,
      prognostic: 'unfavorable',
      predictive: true,
      targetedTherapies: ['Cetuximab', 'Panitumumab'],
      clinicalSignificance: 'EGFR overexpression; EGFR inhibitor sensitive',
    },
    {
      gene: 'MSI',
      mutation: 'Microsatellite Instability',
      frequency: 10,
      prognostic: 'favorable',
      predictive: true,
      targetedTherapies: ['Pembrolizumab', 'Nivolumab'],
      clinicalSignificance: 'MSI-H; immunotherapy sensitive',
    },
    {
      gene: 'PD-L1',
      mutation: 'High expression',
      frequency: 40,
      prognostic: 'neutral',
      predictive: true,
      targetedTherapies: ['Pembrolizumab', 'Nivolumab'],
      clinicalSignificance: 'Checkpoint ligand; immunotherapy sensitive',
    },
  ],
};

// ============================================================================
// BLOOD DISORDER DEFINITIONS
// ============================================================================

const BLOOD_DISORDER_PROFILES: Record<BloodDisorderType, Partial<BloodDisorderProfile>> = {
  hemophilia_a: {
    severity: 'severe',
    geneticBasis: 'Factor VIII deficiency',
    affectedGenes: ['F8'],
    inheritancePattern: 'x_linked',
    clottingFactorLevels: { 'Factor VIII': 5 },
    bleedingRiskScore: 85,
    thrombosisRiskScore: 5,
    managementStrategy: ['Factor VIII replacement', 'Prophylactic therapy', 'Gene therapy'],
  },
  hemophilia_b: {
    severity: 'severe',
    geneticBasis: 'Factor IX deficiency',
    affectedGenes: ['F9'],
    inheritancePattern: 'x_linked',
    clottingFactorLevels: { 'Factor IX': 5 },
    bleedingRiskScore: 80,
    thrombosisRiskScore: 5,
    managementStrategy: ['Factor IX replacement', 'Prophylactic therapy'],
  },
  sickle_cell: {
    severity: 'severe',
    geneticBasis: 'Hemoglobin S polymerization',
    affectedGenes: ['HBB'],
    inheritancePattern: 'autosomal_recessive',
    clottingFactorLevels: { Hemoglobin: 7 },
    bleedingRiskScore: 30,
    thrombosisRiskScore: 75,
    managementStrategy: ['Hydroxyurea', 'Blood transfusion', 'Bone marrow transplant', 'Gene therapy'],
  },
  thalassemia: {
    severity: 'moderate',
    geneticBasis: 'Reduced hemoglobin synthesis',
    affectedGenes: ['HBA1', 'HBB'],
    inheritancePattern: 'autosomal_recessive',
    clottingFactorLevels: { Hemoglobin: 8 },
    bleedingRiskScore: 20,
    thrombosisRiskScore: 40,
    managementStrategy: ['Blood transfusion', 'Iron chelation', 'Folic acid', 'Bone marrow transplant'],
  },
  von_willebrand: {
    severity: 'mild',
    geneticBasis: 'von Willebrand factor deficiency',
    affectedGenes: ['VWF'],
    inheritancePattern: 'autosomal_dominant',
    clottingFactorLevels: { 'von Willebrand Factor': 50 },
    bleedingRiskScore: 40,
    thrombosisRiskScore: 5,
    managementStrategy: ['DDAVP', 'von Willebrand factor concentrate'],
  },
  thrombophilia: {
    severity: 'moderate',
    geneticBasis: 'Increased thrombosis risk',
    affectedGenes: ['F5', 'F2', 'SERPINC1'],
    inheritancePattern: 'autosomal_dominant',
    clottingFactorLevels: { 'Prothrombin': 120 },
    bleedingRiskScore: 10,
    thrombosisRiskScore: 80,
    managementStrategy: ['Anticoagulation', 'Thromboprophylaxis', 'Lifestyle modification'],
  },
  aplastic_anemia: {
    severity: 'severe',
    geneticBasis: 'Bone marrow failure',
    affectedGenes: ['TERC', 'TERT', 'DKC1'],
    inheritancePattern: 'autosomal_recessive',
    clottingFactorLevels: { 'RBC count': 2, 'WBC count': 1, 'Platelet count': 1 },
    bleedingRiskScore: 70,
    thrombosisRiskScore: 20,
    managementStrategy: ['Immunosuppression', 'Stem cell transplant', 'Growth factors'],
  },
  myelodysplastic: {
    severity: 'severe',
    geneticBasis: 'Clonal hematopoietic disorder',
    affectedGenes: ['TP53', 'SF3B1', 'TET2'],
    inheritancePattern: 'autosomal_dominant',
    clottingFactorLevels: { 'RBC count': 4, 'WBC count': 3, 'Platelet count': 2 },
    bleedingRiskScore: 50,
    thrombosisRiskScore: 30,
    managementStrategy: ['Hypomethylating agents', 'Lenalidomide', 'Stem cell transplant'],
  },
};

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze cancer based on biomarker profile
 */
export async function analyzeCancer(
  cancerType: CancerType,
  biomarkers: string[],
  stage: string,
  grade: string
): Promise<CancerProfile> {
  const availableBiomarkers = CANCER_BIOMARKERS[cancerType] || [];
  const detectedBiomarkers = availableBiomarkers.filter(b =>
    biomarkers.some(input => input.toLowerCase().includes(b.gene.toLowerCase()))
  );

  // Calculate tumor mutational burden
  const tmb = detectedBiomarkers.length * 2.5; // Simplified TMB calculation

  // Determine immune infiltration based on biomarkers
  let immuneInfiltration: 'cold' | 'warm' | 'hot' = 'cold';
  if (detectedBiomarkers.some(b => b.gene === 'PD-L1')) {
    immuneInfiltration = 'hot';
  } else if (detectedBiomarkers.length > 3) {
    immuneInfiltration = 'warm';
  }

  // Estimate survival based on stage and biomarkers
  const stageMultiplier = { 'I': 0.9, 'II': 0.7, 'III': 0.5, 'IV': 0.2 }[stage] || 0.5;
  const unfavorableBiomarkerCount = detectedBiomarkers.filter(b => b.prognostic === 'unfavorable').length;
  const survivalAdjustment = Math.max(0.1, 1 - unfavorableBiomarkerCount * 0.1);

  return {
    cancerType,
    stage,
    grade,
    histology: `${cancerType.charAt(0).toUpperCase() + cancerType.slice(1)} cancer`,
    biomarkers: detectedBiomarkers,
    mutationBurden: tmb,
    microsatelliteInstability: detectedBiomarkers.some(b => b.gene === 'MSI'),
    tumorMutationalBurden: tmb > 10 ? 'high' : tmb > 5 ? 'intermediate' : 'low',
    neoantigenLoad: Math.round(tmb * 0.8),
    immuneInfiltration,
    estimatedSurvival: {
      oneYear: Math.round(95 * stageMultiplier * survivalAdjustment),
      threeYear: Math.round(80 * stageMultiplier * survivalAdjustment),
      fiveYear: Math.round(60 * stageMultiplier * survivalAdjustment),
    },
  };
}

/**
 * Analyze blood disorder
 */
export async function analyzeBloodDisorder(
  disorderType: BloodDisorderType,
  geneticMutations: string[]
): Promise<BloodDisorderProfile> {
  const baseProfile = BLOOD_DISORDER_PROFILES[disorderType] || {};

  return {
    disorderType,
    severity: (baseProfile.severity as any) || 'moderate',
    geneticBasis: baseProfile.geneticBasis || 'Unknown',
    affectedGenes: baseProfile.affectedGenes || [],
    inheritancePattern: (baseProfile.inheritancePattern as any) || 'autosomal_dominant',
    clottingFactorLevels: baseProfile.clottingFactorLevels || {},
    bleedingRiskScore: baseProfile.bleedingRiskScore || 50,
    thrombosisRiskScore: baseProfile.thrombosisRiskScore || 50,
    managementStrategy: baseProfile.managementStrategy || [],
  };
}

/**
 * Generate treatment recommendations using LLM
 */
export async function generateTreatmentRecommendations(
  cancerProfile: CancerProfile
): Promise<TreatmentRecommendation[]> {
  const biomarkerSummary = cancerProfile.biomarkers
    .map(b => `${b.gene}: ${b.mutation} (${b.targetedTherapies.join(', ')})`)
    .join('\n');

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are an oncology expert. Generate treatment recommendations based on cancer biomarkers and stage.
        Return JSON array with: treatmentName, category, efficacyScore (0-100), toxicityScore (0-100), clinicalEvidence, contraindications (array), monitoringRequirements (array), estimatedResponse (0-100).`,
      },
      {
        role: 'user',
        content: `Generate treatment recommendations for:
        Cancer Type: ${cancerProfile.cancerType}
        Stage: ${cancerProfile.stage}
        Grade: ${cancerProfile.grade}
        Biomarkers:
        ${biomarkerSummary}
        
        Provide 3-5 treatment options ranked by efficacy.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'treatment_recommendations',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  treatmentName: { type: 'string' },
                  category: { type: 'string', enum: ['targeted', 'immunotherapy', 'chemotherapy', 'hormonal', 'supportive'] },
                  efficacyScore: { type: 'number', minimum: 0, maximum: 100 },
                  toxicityScore: { type: 'number', minimum: 0, maximum: 100 },
                  clinicalEvidence: { type: 'string' },
                  contraindications: { type: 'array', items: { type: 'string' } },
                  monitoringRequirements: { type: 'array', items: { type: 'string' } },
                  estimatedResponse: { type: 'number', minimum: 0, maximum: 100 },
                },
                required: ['treatmentName', 'category', 'efficacyScore', 'toxicityScore', 'clinicalEvidence', 'contraindications', 'monitoringRequirements', 'estimatedResponse'],
                additionalProperties: false,
              },
            },
          },
          required: ['recommendations'],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (typeof content === 'string') {
      const parsed = JSON.parse(content);
      return parsed.recommendations || [];
    }
  } catch (error) {
    console.error('[MultiCancer] Failed to parse treatment recommendations:', error);
  }

  return [];
}

/**
 * Generate clinical summary with proper output
 */
export async function generateClinicalSummary(
  cancerProfile: CancerProfile,
  treatments: TreatmentRecommendation[]
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are an oncology expert. Generate a comprehensive clinical summary for a patient.
        Include: diagnosis, stage, key biomarkers, prognosis, recommended treatments, monitoring plan.`,
      },
      {
        role: 'user',
        content: `Generate clinical summary for:
        Cancer: ${cancerProfile.cancerType} (Stage ${cancerProfile.stage}, Grade ${cancerProfile.grade})
        Key Biomarkers: ${cancerProfile.biomarkers.map(b => b.gene).join(', ')}
        TMB: ${cancerProfile.tumorMutationalBurden}
        Immune Infiltration: ${cancerProfile.immuneInfiltration}
        5-Year Survival: ${cancerProfile.estimatedSurvival.fiveYear}%
        
        Recommended Treatments:
        ${treatments.map(t => `- ${t.treatmentName} (${t.category}, efficacy: ${t.efficacyScore}%)`).join('\n')}`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === 'string' ? content : 'Unable to generate summary';
}

export const SUPPORTED_CANCER_TYPES = Object.keys(CANCER_BIOMARKERS) as CancerType[];
export const SUPPORTED_BLOOD_DISORDERS = Object.keys(BLOOD_DISORDER_PROFILES) as BloodDisorderType[];


/**
 * Validate biomarker profile for clinical consistency
 * Enforces mutual exclusivity rules based on Newton Guardian PWA analysis
 */
export function validateBiomarkerProfile(profile: CancerProfile): { valid: boolean; alerts: string[] } {
  const alerts: string[] = [];

  // BRCA1/HER2 Mutual Exclusivity Validation (Breast Cancer)
  if (profile.cancerType === 'breast') {
    const hasBRCA1 = profile.biomarkers.some(b => b.gene === 'BRCA1');
    const hasHER2 = profile.biomarkers.some(b => b.gene === 'HER2');

    if (hasBRCA1 && hasHER2) {
      alerts.push(
        '⚠️ CLINICAL ALERT - MUTUAL EXCLUSIVITY VIOLATION: ' +
        'BRCA1 and HER2 are mutually exclusive in breast cancer. ' +
        'BRCA1-mutated tumors are typically Triple-Negative (HER2-negative) and arise from basal-like differentiation. ' +
        'HER2-positive tumors represent a distinct molecular subtype with different cells of origin. ' +
        'This combination suggests either: (1) Sequencing error, (2) Tumor heterogeneity with distinct clones, ' +
        'or (3) Misclassification. RECOMMEND CLINICAL REVIEW AND VALIDATION.'
      );
    }

    // BRCA1 should be associated with Triple-Negative phenotype
    if (hasBRCA1) {
      const hasER = profile.biomarkers.some(b => b.gene === 'ER' && b.mutation === 'Positive');
      const hasPR = profile.biomarkers.some(b => b.gene === 'PR' && b.mutation === 'Positive');
      if (hasER || hasPR) {
        alerts.push(
          '⚠️ CLINICAL ALERT - UNEXPECTED PATTERN: ' +
          'BRCA1-mutated tumors are typically Triple-Negative (ER/PR negative). ' +
          'This profile shows hormone receptor positivity, which is unusual. ' +
          'Verify biomarker accuracy.'
        );
      }
    }
  }

  return {
    valid: alerts.length === 0,
    alerts,
  };
}

/**
 * Get treatment recommendations with BRCA1/HER2 specific logic
 */
export function getBiomarkerSpecificTreatments(profile: CancerProfile): string[] {
  const treatments: string[] = [];

  if (profile.cancerType === 'breast') {
    const hasBRCA1 = profile.biomarkers.some(b => b.gene === 'BRCA1');
    const hasHER2 = profile.biomarkers.some(b => b.gene === 'HER2');

    if (hasBRCA1) {
      // BRCA1-mutated breast cancer: PARP inhibitors are primary recommendation
      treatments.push('Olaparib (PARP inhibitor)');
      treatments.push('Talazoparib (PARP inhibitor)');
      treatments.push('Rucaparib (PARP inhibitor)');
      treatments.push('Platinum-based chemotherapy');
    }

    if (hasHER2) {
      // HER2-positive breast cancer: HER2-targeted therapies
      treatments.push('Trastuzumab (Herceptin)');
      treatments.push('Pertuzumab');
      treatments.push('T-DM1 (Trastuzumab emtansine)');
      treatments.push('Lapatinib');
    }
  }

  return treatments;
}
