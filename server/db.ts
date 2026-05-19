import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  credits, 
  agentUsageLog, 
  paymentTransactions,
  genomicsMutations,
  proteinStructures,
  cancerProfiles,
  geneticScreeningResults,
  crossAgentSyncData,
  analyticsAggregates
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Credit Management Functions
 */
export async function getUserCredits(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializeUserCredits(userId: number, initialBalance: number = 100) {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getUserCredits(userId);
    if (existing) return existing;

    const result = await db.insert(credits).values({
      userId,
      balance: initialBalance,
      totalEarned: initialBalance,
      totalSpent: 0,
    });

    return await getUserCredits(userId);
  } catch (error) {
    console.error("[Database] Failed to initialize credits:", error);
    return null;
  }
}

export async function deductCredits(userId: number, amount: number, agentId: string, agentName: string) {
  const db = await getDb();
  if (!db) return false;

  try {
    const userCredits = await getUserCredits(userId);
    if (!userCredits || userCredits.balance < amount) {
      return false;
    }

    // Deduct credits
    await db.update(credits)
      .set({
        balance: userCredits.balance - amount,
        totalSpent: userCredits.totalSpent + amount,
      })
      .where(eq(credits.userId, userId));

    // Log usage
    await db.insert(agentUsageLog).values({
      userId,
      agentId,
      agentName,
      creditsCost: amount,
    });

    return true;
  } catch (error) {
    console.error("[Database] Failed to deduct credits:", error);
    return false;
  }
}

export async function addCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const userCredits = await getUserCredits(userId);
    if (!userCredits) {
      return false;
    }

    await db.update(credits)
      .set({
        balance: userCredits.balance + amount,
        totalEarned: userCredits.totalEarned + amount,
      })
      .where(eq(credits.userId, userId));

    return true;
  } catch (error) {
    console.error("[Database] Failed to add credits:", error);
    return false;
  }
}

/**
 * Payment Transaction Functions
 */
export async function createPaymentTransaction(data: {
  userId: number;
  transactionId: string;
  phoneNumber: string;
  amount: string;
  credits: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(paymentTransactions).values({
      userId: data.userId,
      transactionId: data.transactionId,
      phoneNumber: data.phoneNumber,
      amount: data.amount as any,
      credits: data.credits,
      status: 'pending',
    });

    return await db.select().from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, data.transactionId))
      .limit(1)
      .then(r => r[0] || null);
  } catch (error) {
    console.error("[Database] Failed to create payment transaction:", error);
    return null;
  }
}

export async function updatePaymentTransaction(transactionId: string, data: {
  status: 'completed' | 'failed' | 'cancelled';
  mpesaReceiptNumber?: string;
  mpesaResultCode?: string;
  mpesaResultDesc?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(paymentTransactions)
      .set({
        status: data.status,
        mpesaReceiptNumber: data.mpesaReceiptNumber,
        mpesaResultCode: data.mpesaResultCode,
        mpesaResultDesc: data.mpesaResultDesc,
        completedAt: data.status === 'completed' ? new Date() : undefined,
      })
      .where(eq(paymentTransactions.transactionId, transactionId));

    return await db.select().from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, transactionId))
      .limit(1)
      .then(r => r[0] || null);
  } catch (error) {
    console.error("[Database] Failed to update payment transaction:", error);
    return null;
  }
}

export async function getPaymentTransaction(transactionId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(paymentTransactions)
    .where(eq(paymentTransactions.transactionId, transactionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Analytics Functions
 */
export async function getUserUsageStats(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return null;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db.select().from(agentUsageLog)
      .where(and(
        eq(agentUsageLog.userId, userId),
        gte(agentUsageLog.createdAt, startDate)
      ));

    const totalCreditsSpent = logs.reduce((sum, log) => sum + log.creditsCost, 0);
    const agentUsageMap: Record<string, number> = {};
    
    logs.forEach(log => {
      agentUsageMap[log.agentName] = (agentUsageMap[log.agentName] || 0) + 1;
    });

    return {
      totalUsages: logs.length,
      totalCreditsSpent,
      agentUsageMap,
      logs,
    };
  } catch (error) {
    console.error("[Database] Failed to get usage stats:", error);
    return null;
  }
}

export async function getUserPaymentHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get payment history:", error);
    return [];
  }
}

/**
 * Genomics Data Functions
 */
export async function saveGenomicsMutation(data: {
  analysisId: string;
  userId: number;
  chromosome: string;
  position: number;
  reference: string;
  alternate: string;
  variantType: string;
  consequence?: string;
  clinicalSignificance?: string;
  alleleFrequency?: number;
  metadata?: any;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(genomicsMutations).values(data as any);
    return true;
  } catch (error) {
    console.error("[Database] Failed to save genomics mutation:", error);
    return false;
  }
}

export async function saveProteinStructure(data: {
  analysisId: string;
  userId: number;
  proteinId: string;
  sequence: string;
  pdbStructure?: string;
  confidenceScore?: number;
  predictedFunction?: string;
  drugInteractions?: any;
  metadata?: any;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(proteinStructures).values(data as any);
    return true;
  } catch (error) {
    console.error("[Database] Failed to save protein structure:", error);
    return false;
  }
}

export async function saveCancerProfile(data: {
  analysisId: string;
  userId: number;
  cancerType: string;
  stage?: string;
  tumorMutationalBurden?: number;
  mutationCount?: number;
  riskScore?: number;
  prognosis?: string;
  treatmentRecommendations?: any;
  biomarkers?: any;
  metadata?: any;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(cancerProfiles).values(data as any);
    return true;
  } catch (error) {
    console.error("[Database] Failed to save cancer profile:", error);
    return false;
  }
}

/**
 * Cross-Agent Sync Functions
 */
export async function shareAnalysisData(data: {
  analysisId: string;
  userId: number;
  sourceAgent: string;
  dataType: string;
  data: any;
  accessibleAgents?: string[];
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(crossAgentSyncData).values({
      analysisId: data.analysisId,
      userId: data.userId,
      sourceAgent: data.sourceAgent,
      dataType: data.dataType,
      data: data.data,
      isShared: true,
      accessibleAgents: data.accessibleAgents ? JSON.stringify(data.accessibleAgents) : null,
    } as any);
    return true;
  } catch (error) {
    console.error("[Database] Failed to share analysis data:", error);
    return false;
  }
}

export async function getSharedAnalysisData(userId: number, analysisId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(crossAgentSyncData)
      .where(and(
        eq(crossAgentSyncData.userId, userId),
        eq(crossAgentSyncData.analysisId, analysisId),
        eq(crossAgentSyncData.isShared, true)
      ));
  } catch (error) {
    console.error("[Database] Failed to get shared analysis data:", error);
    return [];
  }
}
