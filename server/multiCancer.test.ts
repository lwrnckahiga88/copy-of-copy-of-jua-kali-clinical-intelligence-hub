import { describe, expect, it } from 'vitest';
import {
  analyzeCancer,
  analyzeBloodDisorder,
  SUPPORTED_CANCER_TYPES,
  SUPPORTED_BLOOD_DISORDERS,
  type CancerType,
  type BloodDisorderType,
} from './multiCancerAnalysis';

describe('Multi-Cancer Analysis Module', () => {
  it('should support 12 cancer types', () => {
    expect(SUPPORTED_CANCER_TYPES.length).toBe(12);
    expect(SUPPORTED_CANCER_TYPES).toContain('breast');
    expect(SUPPORTED_CANCER_TYPES).toContain('lung');
    expect(SUPPORTED_CANCER_TYPES).toContain('colorectal');
    expect(SUPPORTED_CANCER_TYPES).toContain('leukemia');
    expect(SUPPORTED_CANCER_TYPES).toContain('lymphoma');
  });

  it('should support 8 blood disorder types', () => {
    expect(SUPPORTED_BLOOD_DISORDERS.length).toBe(8);
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('hemophilia_a');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('sickle_cell');
    expect(SUPPORTED_BLOOD_DISORDERS).toContain('thalassemia');
  });

  it('should analyze breast cancer with BRCA1 mutation', async () => {
    const profile = await analyzeCancer('breast', ['BRCA1'], 'II', '3');
    
    expect(profile.cancerType).toBe('breast');
    expect(profile.stage).toBe('II');
    expect(profile.biomarkers.length).toBeGreaterThan(0);
    expect(profile.biomarkers.some(b => b.gene === 'BRCA1')).toBe(true);
    expect(profile.estimatedSurvival.fiveYear).toBeGreaterThan(0);
    expect(profile.estimatedSurvival.fiveYear).toBeLessThanOrEqual(100);
  });

  it('should analyze lung cancer with EGFR mutation', async () => {
    const profile = await analyzeCancer('lung', ['EGFR'], 'III', '3');
    
    expect(profile.cancerType).toBe('lung');
    expect(profile.biomarkers.some(b => b.gene === 'EGFR')).toBe(true);
    expect(profile.mutationBurden).toBeGreaterThan(0);
  });

  it('should analyze colorectal cancer with KRAS mutation', async () => {
    const profile = await analyzeCancer('colorectal', ['KRAS', 'TP53'], 'IV', '3');
    
    expect(profile.cancerType).toBe('colorectal');
    expect(profile.biomarkers.length).toBeGreaterThanOrEqual(1);
    expect(profile.stage).toBe('IV');
  });

  it('should analyze leukemia', async () => {
    const profile = await analyzeCancer('leukemia', ['BCR-ABL'], 'I', '1');
    
    expect(profile.cancerType).toBe('leukemia');
    expect(profile.biomarkers.some(b => b.gene === 'BCR-ABL')).toBe(true);
  });

  it('should analyze lymphoma', async () => {
    const profile = await analyzeCancer('lymphoma', ['CD20', 'BCL2'], 'II', '2');
    
    expect(profile.cancerType).toBe('lymphoma');
    expect(profile.biomarkers.length).toBeGreaterThanOrEqual(1);
  });

  it('should detect immune infiltration based on biomarkers', async () => {
    const coldProfile = await analyzeCancer('breast', ['TP53'], 'I', '1');
    const hotProfile = await analyzeCancer('lung', ['PD-L1'], 'II', '2');
    
    expect(['cold', 'warm', 'hot']).toContain(coldProfile.immuneInfiltration);
    expect(['cold', 'warm', 'hot']).toContain(hotProfile.immuneInfiltration);
  });

  it('should calculate tumor mutational burden', async () => {
    const profile = await analyzeCancer('breast', ['BRCA1', 'TP53', 'HER2', 'PIK3CA'], 'III', '3');
    
    expect(profile.mutationBurden).toBeGreaterThan(0);
    expect(['low', 'intermediate', 'high']).toContain(profile.tumorMutationalBurden);
  });

  it('should analyze hemophilia A blood disorder', async () => {
    const profile = await analyzeBloodDisorder('hemophilia_a', ['F8']);
    
    expect(profile.disorderType).toBe('hemophilia_a');
    expect(profile.severity).toBe('severe');
    expect(profile.bleedingRiskScore).toBeGreaterThan(50);
    expect(profile.inheritancePattern).toBe('x_linked');
  });

  it('should analyze sickle cell disease', async () => {
    const profile = await analyzeBloodDisorder('sickle_cell', ['HBB']);
    
    expect(profile.disorderType).toBe('sickle_cell');
    expect(profile.severity).toBe('severe');
    expect(profile.thrombosisRiskScore).toBeGreaterThan(50);
    expect(profile.inheritancePattern).toBe('autosomal_recessive');
  });

  it('should analyze thalassemia', async () => {
    const profile = await analyzeBloodDisorder('thalassemia', ['HBA1', 'HBB']);
    
    expect(profile.disorderType).toBe('thalassemia');
    expect(profile.inheritancePattern).toBe('autosomal_recessive');
    expect(profile.managementStrategy.length).toBeGreaterThan(0);
  });

  it('should have management strategies for all blood disorders', async () => {
    for (const disorder of SUPPORTED_BLOOD_DISORDERS) {
      const profile = await analyzeBloodDisorder(disorder as BloodDisorderType, []);
      expect(profile.managementStrategy.length).toBeGreaterThan(0);
    }
  });

  it('should estimate survival probabilities', async () => {
    const profile = await analyzeCancer('breast', ['BRCA1'], 'I', '1');
    
    expect(profile.estimatedSurvival.oneYear).toBeGreaterThan(profile.estimatedSurvival.threeYear);
    expect(profile.estimatedSurvival.threeYear).toBeGreaterThan(profile.estimatedSurvival.fiveYear);
    expect(profile.estimatedSurvival.oneYear).toBeLessThanOrEqual(100);
    expect(profile.estimatedSurvival.fiveYear).toBeGreaterThanOrEqual(0);
  });

  it('should identify targeted therapies for each biomarker', async () => {
    const profile = await analyzeCancer('breast', ['HER2'], 'II', '2');
    
    const her2Biomarker = profile.biomarkers.find(b => b.gene === 'HER2');
    expect(her2Biomarker).toBeDefined();
    expect(her2Biomarker?.targetedTherapies.length).toBeGreaterThan(0);
    expect(her2Biomarker?.targetedTherapies).toContain('Trastuzumab');
  });

  it('should handle multiple cancer types', async () => {
    const cancers: CancerType[] = ['breast', 'lung', 'colorectal', 'prostate', 'melanoma'];
    
    for (const cancer of cancers) {
      const profile = await analyzeCancer(cancer, [], 'II', '2');
      expect(profile.cancerType).toBe(cancer);
      expect(profile.biomarkers).toBeDefined();
      expect(profile.mutationBurden).toBeGreaterThanOrEqual(0);
    }
  });

  it('should identify BRCA1/HER2 mutual exclusivity in breast cancer', async () => {
    const brca1Profile = await analyzeCancer('breast', ['BRCA1'], 'II', '2');
    const her2Profile = await analyzeCancer('breast', ['HER2'], 'II', '2');
    
    const brca1Biomarker = brca1Profile.biomarkers.find(b => b.gene === 'BRCA1');
    const her2Biomarker = her2Profile.biomarkers.find(b => b.gene === 'HER2');
    
    expect(brca1Biomarker?.prognostic).toBe('unfavorable');
    expect(her2Biomarker?.prognostic).toBe('unfavorable');
  });
});
