import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { SwarmRouter, GeoRouter, AmbulanceRouter, TriageEngine } from "./studioOS";
import { JarvisRouter, IntentRequestSchema, IntentType, ApifyOrchestrator } from "./jarvis";
import { AgentIntentSchema, createJarvisAgentRouter } from "./jarvisAgent";
import { studioOSRegistry } from "./studioOSRegistry";
import * as hospitalApi from "./hospitalApi";
import { fetchAndParseAgents, groupAgentsByCategory, fetchHealthAIFiles } from "./githubFetcher";
import { agentRouter } from "./routers/agentRouter";
import { githubUpdateRouter } from "./routers/githubUpdateRouter";
import { ENV } from "./_core/env";
// Agent Graph Architecture
import { compileRepoToAgentGraph } from "./agent-core/compiler";
import { agentGraph } from "./agent-core/graph";
import { SwarmBus } from "./swarm/swarmBus";
import { nodeRegistry } from "./swarm/nodeRegistry";
import { outcomeStore } from "./rl/outcomeStore";
import { policyMemory } from "./rl/rewardEngine";
import { processOutcome } from "./rl/feedbackLoop";
import { applyRepoPatch } from "./agents/githubUpdateAgent";
import { generatePatch } from "./router/jarvisPatchEngine";

export const appRouter = router({
  system: systemRouter,
  githubUpdate: githubUpdateRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // StudioOS Clinical Intelligence Grid
  clinicalGrid: router({
    getNetworkStatus: publicProcedure.query(() => {
      const ranked = SwarmRouter.run();
      return ranked.map((h) => ({
        id: h.id,
        name: h.name,
        load: h.load,
        rank: h.rank,
        status: h.status,
      }));
    }),

    getGeoRouting: publicProcedure
      .input(
        z.object({
          lat: z.number().optional().default(-1.292),
          lon: z.number().optional().default(36.822),
        })
      )
      .query(({ input }) => {
        const routed = GeoRouter.run(input.lat, input.lon);
        return routed.map((h) => ({
          id: h.id,
          name: h.name,
          distanceKm: h.distanceKm,
          score: h.score,
          rank: h.rank,
        }));
      }),

    getFleetStatus: publicProcedure.query(() => {
      return AmbulanceRouter.getFleetStatus();
    }),

    dispatchAmbulance: publicProcedure.mutation(() => {
      const result = AmbulanceRouter.dispatch();
      return {
        targetHospital: result.targetHospital
          ? {
              id: result.targetHospital.id,
              name: result.targetHospital.name,
              load: result.targetHospital.load,
            }
          : null,
        assignedAmbulance: result.assignedAmbulance
          ? {
              id: result.assignedAmbulance.id,
              callSign: result.assignedAmbulance.callSign,
            }
          : null,
        eta: result.eta,
      };
    }),

    resetFleet: publicProcedure.mutation(() => {
      AmbulanceRouter.reset();
      return { success: true };
    }),

    computeTriage: publicProcedure
      .input(
        z.object({
          heartRate: z.number(),
          systolicBP: z.number(),
          spo2: z.number(),
        })
      )
      .mutation(({ input }) => {
        return TriageEngine.compute(input);
      }),
  }),

  // Jarvis Intent Routing Engine
  jarvis: router({
    routeIntent: protectedProcedure
      .input(IntentRequestSchema)
      .mutation(async ({ input, ctx }) => {
        const apifyToken = ENV.apifyToken;
        return JarvisRouter.routeIntent(
          input,
          ctx.user?.role,
          apifyToken
        );
      }),

    getRepoSync: publicProcedure.query(async () => {
      const apifyToken = ENV.apifyToken;
      if (!apifyToken) {
        return {
          success: false,
          error: 'Apify token not configured',
          pages: [],
          stats: { total: 0, inPlatform: 0, unregistered: 0 },
        };
      }

      return JarvisRouter.routeIntent(
        {
          type: IntentType.REPO_SYNC,
          payload: { owner: 'lwrnckahiga88', repo: 'health-ai' },
          metadata: {
            timestamp: Date.now(),
            requestId: `repo-sync-${Date.now()}`,
          },
        },
        'user',
        apifyToken
      );
    }),

    statusCheck: publicProcedure.query(async () => {
      const apifyToken = ENV.apifyToken;
      const apifyConfigured = Boolean(apifyToken);
      const githubConfigured = Boolean(ENV.githubToken);
      return {
        success: true,
        data: {
          jarvis: 'online',
          studioOS: 'operational',
          apify: apifyConfigured ? 'connected' : 'not-configured',
          github: githubConfigured ? 'connected' : 'not-configured',
          timestamp: Date.now(),
        },
        executedAt: Date.now(),
        executionTimeMs: 0,
      };
    }),

    // List Apify actors available on the account
    listActors: publicProcedure.query(async () => {
      const apifyToken = ENV.apifyToken;
      if (!apifyToken) {
        return { success: false, error: 'Apify token not configured', actors: [] };
      }
      try {
        const res = await fetch(`https://api.apify.com/v2/acts?token=${apifyToken}&my=true&limit=50`);
        if (!res.ok) throw new Error(`Apify error: ${res.status}`);
        const data = await res.json() as { data: { items: unknown[] } };
        return { success: true, actors: data.data?.items ?? [] };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err), actors: [] };
      }
    }),

    // Run the health-ai sync actor and return result
    runHealthAiSync: publicProcedure.mutation(async () => {
      const apifyToken = ENV.apifyToken;
      if (!apifyToken) {
        return { success: false, error: 'Apify token not configured' };
      }
      try {
        // Fetch direct from GitHub as primary source (faster than Apify for listing)
        const files = await fetchHealthAIFiles();
        return {
          success: true,
          filesFound: files.length,
          files: files.map(f => ({ name: f.name, url: f.download_url, size: f.size })),
          syncedAt: new Date().toISOString(),
        };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }),

    // Get Apify account info to verify token
    verifyToken: publicProcedure.query(async () => {
      const apifyToken = ENV.apifyToken;
      if (!apifyToken) return { valid: false, reason: 'No token configured' };
      try {
        const res = await fetch(`https://api.apify.com/v2/users/me?token=${apifyToken}`);
        if (!res.ok) return { valid: false, reason: `HTTP ${res.status}` };
        const data = await res.json() as { data: { username: string; plan: { id: string } } };
        return {
          valid: true,
          username: data.data?.username,
          plan: data.data?.plan?.id,
        };
      } catch (err) {
        return { valid: false, reason: err instanceof Error ? err.message : String(err) };
      }
    }),
  }),

  // Hospital Network API
  hospitals: router({
    getAll: publicProcedure.query(async () => {
      return await hospitalApi.getAllHospitals();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await hospitalApi.getHospitalById(input.id);
      }),

    getBySpecialty: publicProcedure
      .input(z.object({ specialty: z.string() }))
      .query(async ({ input }) => {
        return await hospitalApi.getHospitalsBySpecialty(input.specialty);
      }),

    getByStatus: publicProcedure
      .input(z.object({ status: z.enum(['online', 'offline', 'limited']) }))
      .query(async ({ input }) => {
        return await hospitalApi.getHospitalsByStatus(input.status);
      }),

    getWithAvailableBeds: publicProcedure
      .input(z.object({ minBeds: z.number().optional() }))
      .query(async ({ input }) => {
        return await hospitalApi.getHospitalsWithAvailableBeds(input.minBeds);
      }),

    getNearby: publicProcedure
      .input(z.object({ latitude: z.number(), longitude: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await hospitalApi.getNearestHospitals(input.latitude, input.longitude, input.limit);
      }),

    getStatistics: publicProcedure.query(async () => {
      return await hospitalApi.getHospitalStatistics();
    }),
  }),

  // Health-AI Agent System
  healthAiAgents: router({
    fetchAll: publicProcedure.query(async () => {
      try {
        const agents = await fetchAndParseAgents();
        return {
          success: true,
          agents,
          total: agents.length,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: message,
          agents: [],
          total: 0,
        };
      }
    }),

    getGrouped: publicProcedure.query(async () => {
      try {
        const agents = await fetchAndParseAgents();
        const grouped = groupAgentsByCategory(agents);
        return {
          success: true,
          grouped,
          categories: Object.keys(grouped),
          total: agents.length,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: message,
          grouped: {},
          categories: [],
          total: 0,
        };
      }
    }),
  }),

  // Agent System (StudioOS + Jarvis + Apify)
  agents: router({
    routeIntent: protectedProcedure
      .input(AgentIntentSchema)
      .mutation(async ({ input }) => {
        const apifyToken = ENV.apifyToken;
        if (!apifyToken) {
          throw new Error('Apify token not configured');
        }

        const agentRouter = createJarvisAgentRouter(apifyToken);
        return agentRouter.routeIntent({...input, payload: input.payload || {}});
      }),

    discoverAgents: protectedProcedure.mutation(async () => {
      const apifyToken = ENV.apifyToken;
      if (!apifyToken) {
        throw new Error('Apify token not configured');
      }

      const agentRouter = createJarvisAgentRouter(apifyToken);
      return agentRouter.discoverAgents();
    }),

    getAgents: publicProcedure.query(() => {
      return studioOSRegistry.getAllAgents();
    }),

    getAgentState: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(({ input }) => {
        return studioOSRegistry.getAgentState(input.agentId);
      }),

    getRegistryStats: publicProcedure.query(() => {
      return studioOSRegistry.getStats();
    }),

    getSyncStatus: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(({ input }) => {
        return studioOSRegistry.getSyncStatus(input.agentId);
      }),

    getAllSyncStatuses: publicProcedure.query(() => {
      return studioOSRegistry.getAllSyncStatuses();
    }),
  }),

  // Agent Synchronization System
  agentSync: agentRouter,

  // ── Agent Graph Architecture ──────────────────────────────────────────────

  agentGraphRouter: router({
    // Compile HTML files from GitHub into agent graph (no DOM/jsdom)
    compile: publicProcedure.mutation(async () => {
      const files = await fetchHealthAIFiles();
      const nodes = compileRepoToAgentGraph(
        files.map((f) => ({ name: f.name, download_url: f.download_url }))
      );
      agentGraph.load(nodes);
      SwarmBus.emit("graph:reloaded", { data: { total: nodes.length } });
      return { success: true, agentsCompiled: nodes.length, nodes };
    }),

    getGraph: publicProcedure.query(() => {
      return { nodes: agentGraph.all(), stats: agentGraph.stats() };
    }),

    findByCapability: publicProcedure
      .input(z.object({ capability: z.string() }))
      .query(({ input }) => {
        return agentGraph.findByCapability(input.capability as any);
      }),
  }),

  // ── Swarm Bus + Hospital Node Registry ───────────────────────────────────

  swarmRouter: router({
    getNodes: publicProcedure.query(() => {
      return {
        all: nodeRegistry.getAllNodes(),
        online: nodeRegistry.getOnlineNodes(),
      };
    }),

    registerNode: publicProcedure
      .input(z.object({
        id: z.string(),
        name: z.string(),
        region: z.string(),
        country: z.string(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        capabilities: z.array(z.string()),
        activeAgents: z.array(z.string()),
      }))
      .mutation(({ input }) => {
        return nodeRegistry.register(input);
      }),

    heartbeat: publicProcedure
      .input(z.object({ nodeId: z.string() }))
      .mutation(({ input }) => {
        nodeRegistry.heartbeat(input.nodeId);
        return { ok: true };
      }),

    getRecentEvents: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(({ input }) => {
        return SwarmBus.getRecentEvents(input.limit ?? 50);
      }),
  }),

  // ── RL Outcome + Policy Router ────────────────────────────────────────────

  rlRouter: router({
    recordOutcome: publicProcedure
      .input(z.object({
        patientId: z.string(),
        agentId: z.string(),
        action: z.string(),
        outcome: z.enum(["improved", "stable", "worsened", "critical"]),
        context: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(({ input }) => {
        return processOutcome(input);
      }),

    getStats: publicProcedure.query(() => {
      return {
        outcomes: outcomeStore.stats(),
        policies: policyMemory.size(),
        suggestions: policyMemory.getSuggestions(),
        policySnapshot: policyMemory.snapshot(),
      };
    }),

    getRecentOutcomes: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(({ input }) => {
        return outcomeStore.getRecent(input.limit ?? 50);
      }),

    getAgentOutcomes: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(({ input }) => {
        return {
          records: outcomeStore.getByAgent(input.agentId),
          policyScore: policyMemory.snapshot(),
        };
      }),
  }),

  // ── GitHub Update Agent (JGA) ─────────────────────────────────────────────

  jgaRouter: router({
    // Sync compiled agent graph → registry/agents.json in GitHub
    syncRegistryToGitHub: protectedProcedure.mutation(async () => {
      const nodes = agentGraph.all();
      if (nodes.length === 0) {
        return { success: false, error: "Agent graph is empty. Run compile first." };
      }

      const patches = generatePatch({ type: "sync-agent-registry", agents: nodes });

      return applyRepoPatch({
        owner: "lwrnckahiga88",
        repo: "copy-of-copy-of-jua-kali-clinical-intelligence-hub",
        changes: patches,
        commitMessage: `[JGA] Sync ${nodes.length} agents → registry/agents.json`,
      });
    }),

    // Write RL suggestions to registry (advisory only, no code changes)
    writeRLSuggestions: protectedProcedure.mutation(async () => {
      const patches = generatePatch({ type: "write-rl-suggestions" });

      return applyRepoPatch({
        owner: "lwrnckahiga88",
        repo: "copy-of-copy-of-jua-kali-clinical-intelligence-hub",
        changes: patches,
        commitMessage: "[JGA] Update RL optimization suggestions",
      });
    }),

    // Write outcome log snapshot to registry
    writeOutcomeLog: protectedProcedure.mutation(async () => {
      const patches = generatePatch({ type: "write-outcome-log" });

      return applyRepoPatch({
        owner: "lwrnckahiga88",
        repo: "copy-of-copy-of-jua-kali-clinical-intelligence-hub",
        changes: patches,
        commitMessage: "[JGA] Export outcome log snapshot",
      });
    }),

    // Add or update a single agent in registry
    upsertAgent: protectedProcedure
      .input(z.object({
        agentId: z.string(),
        payload: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ input }) => {
        const patches = generatePatch({
          type: "add-agent",
          agentId: input.agentId,
          payload: input.payload as any,
        });

        return applyRepoPatch({
          owner: "lwrnckahiga88",
          repo: "copy-of-copy-of-jua-kali-clinical-intelligence-hub",
          changes: patches,
          commitMessage: `[JGA] Upsert agent: ${input.agentId}`,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
