import { getDb } from './db';
import { crossAgentSyncData } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Agent Synchronization Service
 * Manages real-time data sharing between medical AI agents
 */

export interface AgentSyncPayload {
  analysisId: string;
  userId: number;
  sourceAgent: string;
  dataType: 'variants' | 'risk_assessment' | 'protein_structure' | 'cancer_profile' | 'clinical_notes';
  data: Record<string, unknown>;
  accessibleAgents?: string[];
}

export interface SyncedData {
  id: number;
  analysisId: string;
  userId: number;
  sourceAgent: string;
  dataType: string;
  data: Record<string, unknown>;
  isShared: boolean;
  accessibleAgents: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Default accessible agents for each data type
 */
export const DEFAULT_ACCESSIBLE_AGENTS: Record<string, string[]> = {
  variants: ['genomica', 'clinicalvalidator', 'medos', 'nurseai', 'quorumdee'],
  risk_assessment: ['medos', 'clinicalvalidator', 'nurseai', 'quorumdee', 'kemci'],
  protein_structure: ['genomica', 'clinicalvalidator', 'quorumdee', 'kemci'],
  cancer_profile: ['medos', 'clinicalvalidator', 'quorumdee', 'nurseai', 'genomica'],
  clinical_notes: ['medos', 'nurseai', 'clinicalvalidator', 'quorumdee'],
};

/**
 * Share analysis data with other agents
 */
export async function shareAnalysisData(payload: AgentSyncPayload): Promise<SyncedData | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[AgentSync] Cannot share data: database not available');
    return null;
  }

  try {
    const accessibleAgents = payload.accessibleAgents || DEFAULT_ACCESSIBLE_AGENTS[payload.dataType] || [];

    await db.insert(crossAgentSyncData).values({
      analysisId: payload.analysisId,
      userId: payload.userId,
      sourceAgent: payload.sourceAgent,
      dataType: payload.dataType,
      data: JSON.stringify(payload.data),
      isShared: true,
      accessibleAgents: JSON.stringify(accessibleAgents),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[AgentSync] Data shared from ${payload.sourceAgent} to ${accessibleAgents.join(', ')}`);

    return {
      id: Math.random(),
      analysisId: payload.analysisId,
      userId: payload.userId,
      sourceAgent: payload.sourceAgent,
      dataType: payload.dataType,
      data: payload.data,
      isShared: true,
      accessibleAgents,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('[AgentSync] Failed to share data:', error);
    return null;
  }
}

/**
 * Get shared data accessible to an agent
 */
export async function getSharedDataForAgent(
  userId: number,
  agentName: string,
  dataType?: string
): Promise<SyncedData[]> {
  const db = await getDb();
  if (!db) {
    console.warn('[AgentSync] Cannot retrieve shared data: database not available');
    return [];
  }

  try {
    let allResults = await db
      .select()
      .from(crossAgentSyncData)
      .where(and(eq(crossAgentSyncData.userId, userId), eq(crossAgentSyncData.isShared, true)));

    // Filter by data type if provided
    if (dataType) {
      allResults = allResults.filter(r => r.dataType === dataType);
    }

    // Filter by accessible agents
    return allResults
      .filter(row => {
        const accessibleAgents = JSON.parse(row.accessibleAgents as string || '[]');
        return accessibleAgents.includes(agentName);
      })
      .map(row => ({
        id: row.id,
        analysisId: row.analysisId,
        userId: row.userId,
        sourceAgent: row.sourceAgent,
        dataType: row.dataType,
        data: JSON.parse(row.data as string || '{}'),
        isShared: row.isShared,
        accessibleAgents: JSON.parse(row.accessibleAgents as string || '[]'),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
  } catch (error) {
    console.error('[AgentSync] Failed to retrieve shared data:', error);
    return [];
  }
}

/**
 * Get all shared data for a user (admin view)
 */
export async function getAllSharedData(userId: number): Promise<SyncedData[]> {
  const db = await getDb();
  if (!db) {
    console.warn('[AgentSync] Cannot retrieve all shared data: database not available');
    return [];
  }

  try {
    const results = await db
      .select()
      .from(crossAgentSyncData)
      .where(eq(crossAgentSyncData.userId, userId));

    return results.map(row => ({
      id: row.id,
      analysisId: row.analysisId,
      userId: row.userId,
      sourceAgent: row.sourceAgent,
      dataType: row.dataType,
      data: JSON.parse(row.data as string || '{}'),
      isShared: row.isShared,
      accessibleAgents: JSON.parse(row.accessibleAgents as string || '[]'),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  } catch (error) {
    console.error('[AgentSync] Failed to retrieve all shared data:', error);
    return [];
  }
}

/**
 * Update shared data accessibility
 */
export async function updateDataAccessibility(
  analysisId: string,
  userId: number,
  accessibleAgents: string[]
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn('[AgentSync] Cannot update accessibility: database not available');
    return false;
  }

  try {
    await db
      .update(crossAgentSyncData)
      .set({ accessibleAgents: JSON.stringify(accessibleAgents) })
      .where(and(eq(crossAgentSyncData.analysisId, analysisId), eq(crossAgentSyncData.userId, userId)));

    console.log(`[AgentSync] Updated accessibility for ${analysisId}`);
    return true;
  } catch (error) {
    console.error('[AgentSync] Failed to update accessibility:', error);
    return false;
  }
}

/**
 * Get agent sync statistics
 */
export async function getAgentSyncStats(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn('[AgentSync] Cannot get sync stats: database not available');
    return null;
  }

  try {
    const results = await db
      .select()
      .from(crossAgentSyncData)
      .where(eq(crossAgentSyncData.userId, userId));

    const stats = {
      totalSharedAnalyses: results.length,
      byDataType: {} as Record<string, number>,
      bySourceAgent: {} as Record<string, number>,
      lastSyncTime: results.length > 0 ? results[results.length - 1]?.updatedAt : null,
    };

    results.forEach(row => {
      stats.byDataType[row.dataType] = (stats.byDataType[row.dataType] || 0) + 1;
      stats.bySourceAgent[row.sourceAgent] = (stats.bySourceAgent[row.sourceAgent] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('[AgentSync] Failed to get sync stats:', error);
    return null;
  }
}
