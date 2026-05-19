import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("imaging router", () => {
  it("handles uploadImage with valid input", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.imaging.uploadImage({
      patientId: "P123",
      imageType: "ct",
      imageUrl: "https://example.com/image.jpg",
      bodyPart: "Chest",
      clinicalIndication: "Suspected pneumonia",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("handles getImagingStats query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.imaging.getImagingStats();

    expect(stats).toHaveProperty("totalImages");
    expect(stats).toHaveProperty("imagesByType");
    expect(stats).toHaveProperty("abnormalitiesDetected");
    expect(stats).toHaveProperty("averageRiskScore");
    expect(typeof stats.totalImages).toBe("number");
  });

  it("handles getUserImages query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const images = await caller.imaging.getUserImages({ limit: 10 });

    expect(Array.isArray(images)).toBe(true);
  });

  it("validates imageType enum", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Test with valid image types
    const validTypes = ["ct", "mri", "xray", "ultrasound", "pet", "mammography"] as const;
    for (const type of validTypes) {
      const result = await caller.imaging.uploadImage({
        patientId: "P123",
        imageType: type,
        imageUrl: "https://example.com/image.jpg",
      });
      expect(result).toBeDefined();
    }
  });

  it("requires authentication for imaging procedures", async () => {
    const ctxNoUser = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const caller = appRouter.createCaller(ctxNoUser);

    try {
      await caller.imaging.getImagingStats();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(["UNAUTHORIZED", "NOT_FOUND"]).toContain(error.code);
    }
  });
});

describe("clinical grid router", () => {
  it("handles getGeoRouting query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clinicalGrid.getGeoRouting({
      lat: -1.2921,
      lon: 36.8219,
      maxDistance: 50,
      limit: 5,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("handles getFleetStatus query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clinicalGrid.getFleetStatus();

    expect(Array.isArray(result)).toBe(true);
  });

  it("handles dispatchAmbulance mutation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clinicalGrid.dispatchAmbulance({
      ambulanceId: 1,
      hospitalId: 1,
      patientName: "Test Patient",
      priority: "high",
      emergencyType: "cardiac",
      patientLat: -1.2921,
      patientLon: 36.8219,
    });

    expect(result).toBeDefined();
  });

  it("handles getDispatchHistory query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clinicalGrid.getDispatchHistory({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("handles updateDispatchStatus mutation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clinicalGrid.updateDispatchStatus({
      emergencyCallId: "test-123",
      status: "completed",
      notes: "Patient transported successfully",
    });

    expect(result).toBeDefined();
  });

  it("requires authentication for clinical grid procedures", async () => {
    const ctxNoUser = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const caller = appRouter.createCaller(ctxNoUser);

    try {
      await caller.clinicalGrid.getFleetStatus();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(["UNAUTHORIZED", "NOT_FOUND"]).toContain(error.code);
    }
  });
});
