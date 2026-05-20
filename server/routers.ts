import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { paymentRouter } from "./paymentRouter";
import { genomicsRouter } from "./genomicsRouter";
import { adminRouter } from "./adminRouter";
import { agentRouter } from "./agentRouter";
// import { clinicalGridRouter } from "./clinicalGridRouter";
// import { imagingRouter } from "./imagingRouter";
import { consensusRouter } from "./consensusRouter";
import { bioinformaticsRouter } from "./bioinformaticsRouter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
  payment: paymentRouter,
  genomics: genomicsRouter,
  admin: adminRouter,
  agent: agentRouter,
  // clinicalGrid: clinicalGridRouter,
  // imaging: imagingRouter,
  consensus: consensusRouter,
  bioinformatics: bioinformaticsRouter,
});

export type AppRouter = typeof appRouter;
