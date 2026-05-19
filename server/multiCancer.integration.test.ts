import { describe, it, expect } from 'vitest';
import {
  validateBiomarkerProfile,
  getBiomarkerSpecificTreatments,
  SUPPORTED_CANCER_TYPES,
  SUPPORTED_BLOOD_DISORDERS,
  type CancerProfile,
} from './multiCancerAnalysis';

describe('Multi-Cancer Analysis - BRCA1/HER2 Mutual Exclusivity', () => {
  it('should detect BRCA1/HER2 mutual exclusivity violation', () => {
    const profile: CancerProfile = {
      cancerType: 'breast',
      stage: 'III',
      grade: '3',
      histology: 'Invasive Ductal Carcinoma',
      biomarkers: [
        {
          gene: 'BRCA1',
          mutation: 'Loss of function',
          frequency: 5,
          prognostic: 'unfavorable',
          predictive: true,
          targetedTherapies: ['Olaparib'],
          clinicalSignificance: 'PARP inhibitor sensitive',
        },
        {
          gene: 'HER2',
          mutation: 'Amplification',
          frequency: 15,
          prognostic: 'unfavorable',
          predictive: true,
          targetedTherapies: ['Trastuzumab'],
          clinicalSignificance: 'HER2-targeted therapy sensitive',
        },
      ],
      mutationBurden: 8.5,
      microsatelliteInstability: false,
      tumorMutationalBurden: 'high',
      neoantigenLoad: 12,
      immuneInfiltration: 'warm',
      estimatedSurvival: { oneYear: 85, threeYear: 60, fiveYear: 40 },
    };

    const result = validateBiomarkerProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.alerts[0]).toContain('MUTUAL EXCLUSIVITY VIOLATION');
    expect(result.alerts[0]).toContain('BRCA1');
    expect(result.alerts[0]).toContain('HER2');
  });

  it('should allow BRCA1-positive, HER2-negative profile (Triple-Negative)', () => {
    const profile: CancerProfile = {
      cancerType: 'breast',
      stage: 'II',
      grade: '3',
      histology: 'Invasive Ductal Carcinoma',
      biomarkers: [
        {
          gene: 'BRCA1',
          mutation: 'Loss of function',
          frequency: 5,
          prognostic: 'unfavorable',
          predictive: true,
          targetedTherapies: ['Olaparib'],
          clinicalSignificance: 'PARP inhibitor sensitive',
        },
      ],
      mutationBurden: 9.2,
      microsatelliteInstability: false,
      tumorMutationalBurden: 'high',
      neoantigenLoad: 14,
      immuneInfiltration: 'hot',
      estimatedSurvival: { oneYear: 80, threeYear: 55, fiveYear: 35 },
    };

    const result = validateBiomarkerProfile(profile);
    expect(result.valid).toBe(true);
    expect(result.alerts.length).toBe(0);
  });

  it('should allow HER2-positive, BRCA1-negative profile', () => {
    const profile: CancerProfile = {
      cancerType: 'breast',
      stage: 'II',
      grade: '2',
      histology: 'Invasive Ductal Carcinoma',
      biomarkers: [
        {
          gene: 'HER2',
          mutation: 'Amplification',
          frequency: 15,
          prognostic: 'unfavorable',
          predictive: true,
          targetedTherapies: ['Trastuzumab'],
          clinicalSignificance: 'HER2-targeted therapy sensitive',
        },
      ],
      mutationBurden: 4.1,
      microsatelliteInstability: false,
      tumorMutationalBurden: 'intermediate',
      neoantigenLoad: 6,
      immuneInfiltration: 'warm',
      estimatedSurvival: { oneYear: 90, threeYear: 75, fiveYear: 60 },
    };

    const result = validateBiomarkerProfile(profile);
    expect(result.valid).toBe(true);
    expect(result.alerts.length).toBe(0);
  });

  it('should recommend PARP inhibitors for BRCA1-mutated breast cancer', () => {
    const profile: CancerProfile = {
      cancerType: 'breast',
      stage: 'III',
      grade: '3',
      histology: 'Invasive Ductal Carcinoma',
      biomarkers: [
        {
          gene: 'BRCA1',
          mutation: 'Loss of function',
          frequency: 5,
          prognostic: 'unfavorable',
          predictive: true,
          targetedTherapies: ['Olaparib'],
          clinicalSignificance: 'PARP inhibitor sensitive',
        },
      ],
      mutationBurden: 8.5,
      microsatelliteInstability: false,
      tumorMutationalBurden: 'high',
      neoantigenLoad: 12,
      immuneInfiltration: 'warm',
      estimatedSurvival: { oneYear: 85, threeYear: 60, fiveYear: 40 },
    };

    const treatments = getBiomarkerSpecificTreatments(profile);
    expect(treatments).toContain('Olaparib (PARP inhibitor)');
    expect(treatments).toContain('Talazoparib (PARP inhibitor)');
    expect(treatments).toContain('Platinum-based chemotherapy');
    expect(treatments).not.toContain('Trastuzumab (Herceptin)');
  });

  it('should recommend HER2-targeted therapies for HER2-positive breast cancer', () => {
    const profile: CancerProfile = {
      cancerType: 'breast',
      stage: 'II',
      grade: '2',
      histology: 'Invasive Ductal Carcinoma',
      biomarkers: [
        {
          gene: 'HER2',
          mutation: 'Amplification',
          frequency: 15,
          prognostic: 'unfavorable',
          predictive: true,
          targetedTherapies: ['Trastuzumab'],
          clinicalSignificance: 'HER2-targeted therapy sensitive',
        },
      ],
      mutationBurden: 4.1,
      microsatelliteInstability: false,
      tumorMutationalBurden: 'intermediate',
      neoantigenLoad: 6,
      immuneInfiltration: 'warm',
      estimatedSurvival: { oneYear: 90, threeYear: 75, fiveYear: 60 },
    };

    const treatments = getBiomarkerSpecificTreatments(profile);
    expect(treatments).toContain('Trastuzumab (Herceptin)');
    expect(treatments).toContain('Pertuzumab');
    expect(treatments).toContain('T-DM1 (Trastuzumab emtansine)');
    expect(treatments).not.toContain('Olaparib (PARP inhibitor)');
  });

  it('should support all 12 cancer types', () => {
    expect(SUPPORTED_CANCER_TYPES).toContain('breast');
    expect(SUPPORTED_CANCER_TYPES).toContain('lung');
    expect(SUPPORTED_CANCER_TYPES).toContain('colorectal');
    expect(SUPPORTED_CANCER_TYPES).toContain('ovarian');
    expect(SUPPORTED_CANCER_TYPES).toContain('pancreatic');
    expect(SUPPORTED_CANCER_TYPES).toContain('prostate');
    expect(SUPPORTED_CANCER_TYPES).toContain('melanoma');
    expect(SUPPORTED_CANCER_TYPES).toContain('lymphoma');
    expect(SUPPORTED_CANCER_TYPES).toContain('leukemia');
    expect(SUPPORTED_CANCER_TYPES).toContain('renal');
    expect(SUPPORTED_CANCER_TYPES).toContain('bladder');
    expect(SUPPORTED_CANCER_TYPES).toContain('gastric');
    expect(SUPPORTED_CANCER_TYPES.length).toBe(12);
  });

  it('should support all 8 blood disorders', () => {
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('hemophilia_a');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('hemophilia_b');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('sickle_cell');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('thalassemia');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('von_willebrand');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('thrombophilia');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('aplastic_anemia');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('myelodysplastic');
    expect(SUPPORTED_BLOOD_DISORDERS.length).toBe(8);
  });

  it('should alert on unexpected ER/PR positivity with BRCA1 mutation', () => {
    const profile: CancerProfile = {
      cancerType: 'breast',
      stage: 'II',
      grade: '2',
      histology: 'Invasive Ductal Carcinoma',
      biomarkers: [
        {
          gene: 'BRCA1',
          mutation: 'Loss of function',
          frequency: 5,
          prognostic: 'unfavorable',
          predictive: true,
          targetedTherapies: ['Olaparib'],
          clinicalSignificance: 'PARP inhibitor sensitive',
        },
        {
          gene: 'ER',
          mutation: 'Positive',
          frequency: 70,
          prognostic: 'favorable',
          predictive: true,
          targetedTherapies: ['Tamoxifen'],
          clinicalSignificance: 'Hormone receptor positive',
        },
      ],
      mutationBurden: 6.3,
      microsatelliteInstability: false,
      tumorMutationalBurden: 'intermediate',
      neoantigenLoad: 8,
      immuneInfiltration: 'warm',
      estimatedSurvival: { oneYear: 85, threeYear: 65, fiveYear: 45 },
    };

    const result = validateBiomarkerProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.alerts.some(a => a.includes('Triple-Negative'))).toBe(true);
  });
});
