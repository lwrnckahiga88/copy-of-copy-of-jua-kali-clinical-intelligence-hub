/**
 * Jarvis — Intent Routing Engine
 * Bridges StudioOS (clinical logic) with Apify (execution layer)
 * Provides intent validation, access control, and actor orchestration
 */

import { z } from 'zod';

/**
 * Intent types that Jarvis can route
 */
export enum IntentType {
  REPO_SYNC = 'repo_sync',
  ACTOR_RUN = 'actor_run',
  PAGE_FETCH = 'page_fetch',
  STATUS_CHECK = 'status_check',
}

/**
 * Access control levels
 */
export enum AccessLevel {
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated',
  ADMIN = 'admin',
}

/**
 * Intent request schema
 */
export const IntentRequestSchema = z.object({
  type: z.union([
    z.literal(IntentType.REPO_SYNC),
    z.literal(IntentType.ACTOR_RUN),
    z.literal(IntentType.PAGE_FETCH),
    z.literal(IntentType.STATUS_CHECK),
  ]),
  payload: z.record(z.string(), z.any()).optional(),
  metadata: z.object({
    userId: z.string().optional(),
    timestamp: z.number(),
    requestId: z.string(),
  }),
})

export type IntentRequest = z.infer<typeof IntentRequestSchema>;

// Type-safe intent type extraction
type IntentTypeValue = typeof IntentType[keyof typeof IntentType];

/**
 * Intent response schema
 */
export const IntentResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  executedAt: z.number(),
  executionTimeMs: z.number(),
})

export type IntentResponse = z.infer<typeof IntentResponseSchema>;

/**
 * Access control rules for each intent type
 */
const ACCESS_CONTROL: Record<IntentType, AccessLevel> = {
  [IntentType.REPO_SYNC]: AccessLevel.AUTHENTICATED,
  [IntentType.ACTOR_RUN]: AccessLevel.ADMIN,
  [IntentType.PAGE_FETCH]: AccessLevel.PUBLIC,
  [IntentType.STATUS_CHECK]: AccessLevel.PUBLIC,
};

/**
 * Jarvis UI Compiler
 * Validates intent, checks access, and prepares for execution
 */
export class UICompiler {
  /**
   * Validate user access to an intent
   */
  static validateAccess(
    intentType: IntentTypeValue,
    userRole?: string
  ): { valid: boolean; reason?: string } {
    const requiredLevel = ACCESS_CONTROL[intentType];

    if (requiredLevel === AccessLevel.PUBLIC) {
      return { valid: true };
    }

    if (!userRole) {
      return { valid: false, reason: 'Authentication required' };
    }

    if (requiredLevel === AccessLevel.ADMIN && userRole !== 'admin') {
      return { valid: false, reason: 'Admin access required' };
    }

    return { valid: true };
  }

  /**
   * Compile intent into executable actor parameters
   */
  static compileIntent(intent: IntentRequest): Record<string, unknown> {
    switch (intent.type) {
      case IntentType.REPO_SYNC:
        return {
          owner: intent.payload?.owner ?? 'lwrnckahiga88',
          repo: intent.payload?.repo ?? 'jua.manus',
          branch: intent.payload?.branch ?? 'HEAD',
          forceRefresh: intent.payload?.forceRefresh ?? false,
        };

      case IntentType.ACTOR_RUN:
        return {
          actorId: intent.payload?.actorId,
          input: intent.payload?.input ?? {},
        };

      case IntentType.PAGE_FETCH:
        return {
          pageId: intent.payload?.pageId,
          rawUrl: intent.payload?.rawUrl,
        };

      case IntentType.STATUS_CHECK:
        return {
          component: intent.payload?.component ?? 'all',
        };

      default:
        return {};
    }
  }
}

/**
 * Apify Actor Orchestrator
 * Manages actor invocation and result caching
 */
export class ApifyOrchestrator {
  private static cache: Map<string, { data: unknown; timestamp: number }> =
    new Map();
  private static CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate cache key from actor parameters
   */
  private static getCacheKey(params: Record<string, unknown>): string {
    return JSON.stringify(params);
  }

  /**
   * Check if cached result is still valid
   */
  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  /**
   * Invoke Apify actor (with caching)
   */
  static async invokeActor(
    actorId: string,
    input: Record<string, unknown>,
    apifyToken: string,
    forceRefresh: boolean = false
  ): Promise<unknown> {
    const cacheKey = this.getCacheKey(input);

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log(`[Jarvis] Cache hit for ${actorId}`);
        return cached.data;
      }
    }

    // Invoke actor via Apify API
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyToken}&clean=true`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(
          `Apify API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to invoke actor ${actorId}: ${message}`);
    }
  }

  /**
   * Get actor execution status
   */
  static async getActorStatus(
    actorId: string,
    apifyToken: string
  ): Promise<unknown> {
    const url = `https://api.apify.com/v2/acts/${actorId}?token=${apifyToken}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Apify API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get actor status: ${message}`);
    }
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Jarvis Intent Router
 * Main orchestrator for intent routing and execution
 */
export class JarvisRouter {
  /**
   * Route and execute an intent
   */
  static async routeIntent(
    intent: IntentRequest,
    userRole?: string,
    apifyToken?: string
  ): Promise<IntentResponse> {
    const startTime = Date.now();

    try {
      // Validate access
      const accessCheck = UICompiler.validateAccess(intent.type, userRole);
      if (!accessCheck.valid) {
        return {
          success: false,
          error: accessCheck.reason,
          executedAt: Date.now(),
          executionTimeMs: Date.now() - startTime,
        };
      }

      // Compile intent
      const actorParams = UICompiler.compileIntent(intent);

      // Execute based on intent type
      let result: unknown;

      switch (intent.type) {
      case IntentType.REPO_SYNC:
        if (!apifyToken) {
          throw new Error('Apify token required for repo sync');
        }
        result = await ApifyOrchestrator.invokeActor(
          'oCJIoxpyBQwNGYe0W',
          actorParams,
          apifyToken,
          (intent.payload?.forceRefresh as boolean) ?? false
        );
          break;

        case IntentType.STATUS_CHECK:
          result = {
            jarvis: 'online',
            studioOS: 'operational',
            apify: 'connected',
            timestamp: Date.now(),
          };
          break;

        case IntentType.PAGE_FETCH:
          result = {
            pageId: actorParams.pageId,
            rawUrl: actorParams.rawUrl,
            fetchedAt: Date.now(),
          };
          break;

        case IntentType.ACTOR_RUN:
          if (!apifyToken) {
            throw new Error('Apify token required for actor execution');
          }
          result = await ApifyOrchestrator.invokeActor(
            String(actorParams.actorId ?? 'oCJIoxpyBQwNGYe0W'),
            (actorParams.input as Record<string, unknown>) ?? {},
            apifyToken
          );
          break;

        default:
          throw new Error(`Unknown intent type: ${intent.type}`);
      }

      return {
        success: true,
        data: result,
        executedAt: Date.now(),
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
        executedAt: Date.now(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
