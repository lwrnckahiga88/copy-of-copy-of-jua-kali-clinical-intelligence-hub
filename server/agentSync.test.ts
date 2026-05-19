import { describe, expect, it } from 'vitest';
import {
  shareAnalysisData,
  getSharedDataForAgent,
  DEFAULT_ACCESSIBLE_AGENTS,
} from './agentSyncService';

describe('Agent Sync Service', () => {
  it('should define default accessible agents for each data type', () => {
    expect(DEFAULT_ACCESSIBLE_AGENTS.variants).toContain('genomica');
    expect(DEFAULT_ACCESSIBLE_AGENTS.variants).toContain('clinicalvalidator');
    expect(DEFAULT_ACCESSIBLE_AGENTS.cancer_profile).toContain('medos');
    expect(DEFAULT_ACCESSIBLE_AGENTS.cancer_profile).toContain('nurseai');
  });

  it('should have variants accessible to multiple agents', () => {
    const variantAgents = DEFAULT_ACCESSIBLE_AGENTS.variants;
    expect(variantAgents.length).toBeGreaterThan(3);
    expect(variantAgents).toContain('genomica');
    expect(variantAgents).toContain('clinicalvalidator');
    expect(variantAgents).toContain('medos');
  });

  it('should have risk assessment accessible to clinical agents', () => {
    const riskAgents = DEFAULT_ACCESSIBLE_AGENTS.risk_assessment;
    expect(riskAgents).toContain('medos');
    expect(riskAgents).toContain('clinicalvalidator');
    expect(riskAgents).toContain('nurseai');
  });

  it('should have protein structure accessible to genomics agents', () => {
    const proteinAgents = DEFAULT_ACCESSIBLE_AGENTS.protein_structure;
    expect(proteinAgents).toContain('genomica');
    expect(proteinAgents).toContain('clinicalvalidator');
  });

  it('should have cancer profile accessible to multiple agents', () => {
    const cancerAgents = DEFAULT_ACCESSIBLE_AGENTS.cancer_profile;
    expect(cancerAgents.length).toBeGreaterThan(3);
    expect(cancerAgents).toContain('medos');
    expect(cancerAgents).toContain('clinicalvalidator');
    expect(cancerAgents).toContain('nurseai');
  });

  it('should have clinical notes accessible to clinical agents', () => {
    const clinicalAgents = DEFAULT_ACCESSIBLE_AGENTS.clinical_notes;
    expect(clinicalAgents).toContain('medos');
    expect(clinicalAgents).toContain('nurseai');
    expect(clinicalAgents).toContain('clinicalvalidator');
  });
});
