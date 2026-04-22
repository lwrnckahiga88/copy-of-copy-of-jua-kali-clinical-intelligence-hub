import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { SwarmRouter, GeoRouter, AmbulanceRouter, TriageEngine } from "./studioOS";
import { JarvisRouter, IntentRequestSchema, IntentType } from "./jarvis";
import { AgentIntentSchema, createJarvisAgentRouter } from "./jarvisAgent";
import { studioOSRegistry } from "./studioOSRegistry";

export const appRouter = router({
  system: systemRouter,
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
        const apifyToken = process.env.APIFY_TOKEN;
        return JarvisRouter.routeIntent(
          input,
          ctx.user?.role,
          apifyToken
        );
      }),

    getRepoSync: publicProcedure.query(async () => {
      const apifyToken = process.env.APIFY_TOKEN;
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
          payload: { owner: 'lwrnckahiga88', repo: 'jua.manus' },
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
      return JarvisRouter.routeIntent(
        {
          type: IntentType.STATUS_CHECK,
          metadata: {
            timestamp: Date.now(),
            requestId: `status-${Date.now()}`,
          },
        },
        'user'
      );
    }),
  }),

  // Agent System (StudioOS + Jarvis + Apify)
  agents: router({
    routeIntent: protectedProcedure
      .input(AgentIntentSchema)
      .mutation(async ({ input }) => {
        const apifyToken = process.env.APIFY_TOKEN;
        if (!apifyToken) {
          throw new Error('Apify token not configured');
        }

        const agentRouter = createJarvisAgentRouter(apifyToken);
        return agentRouter.routeIntent({...input, payload: input.payload || {}});
      }),

    discoverAgents: protectedProcedure.mutation(async () => {
      const apifyToken = process.env.APIFY_TOKEN;
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
});

export type AppRouter = typeof appRouter;
