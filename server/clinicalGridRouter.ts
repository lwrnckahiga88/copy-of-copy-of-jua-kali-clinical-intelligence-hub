import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { ambulances, hospitals, dispatchRecords, InsertDispatchRecord } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Clinical Grid Router: Ambulance dispatch and hospital routing
 * Handles emergency response coordination, geo-routing, and fleet management
 */

export const clinicalGridRouter = router({
  /**
   * Get nearby hospitals sorted by distance and availability
   */
  getGeoRouting: protectedProcedure
    .input(z.object({
      lat: z.number(),
      lon: z.number(),
      maxDistance: z.number().default(50), // km
      limit: z.number().default(5),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const allHospitals = await db.select().from(hospitals);
        
        // Calculate distance using Haversine formula
        const hospitalWithDistance = allHospitals.map((h) => {
          const lat1 = input.lat * Math.PI / 180;
          const lat2 = parseFloat(h.latitude.toString()) * Math.PI / 180;
          const dLat = (parseFloat(h.latitude.toString()) - input.lat) * Math.PI / 180;
          const dLon = (parseFloat(h.longitude.toString()) - input.lon) * Math.PI / 180;
          
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distanceKm = 6371 * c; // Earth's radius in km
          
          // Calculate score: closer hospitals and those with more beds get higher scores
          const availabilityScore = (h.availableBeds / h.capacity) * 100;
          const distanceScore = Math.max(0, 100 - (distanceKm / input.maxDistance) * 100);
          const score = (availabilityScore * 0.4) + (distanceScore * 0.6);
          
          return {
            id: h.id,
            name: h.name,
            latitude: parseFloat(h.latitude.toString()),
            longitude: parseFloat(h.longitude.toString()),
            distanceKm,
            availableBeds: h.availableBeds,
            capacity: h.capacity,
            emergencyDepartment: h.emergencyDepartment,
            traumaCenter: h.traumaCenter,
            score,
            rank: 0,
          };
        });

        // Filter by max distance and sort by score
        const filtered = hospitalWithDistance
          .filter(h => h.distanceKm <= input.maxDistance)
          .sort((a, b) => b.score - a.score)
          .slice(0, input.limit);

        // Add rank
        return filtered.map((h, idx) => ({ ...h, rank: idx + 1 }));
      } catch (error) {
        console.error("[ClinicalGrid] Error getting geo routing:", error);
        return [];
      }
    }),

  /**
   * Get current ambulance fleet status
   */
  getFleetStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const fleet = await db.select().from(ambulances);
        return fleet.map(amb => ({
          id: amb.id,
          callSign: amb.callSign,
          lat: parseFloat(amb.latitude.toString()),
          lon: parseFloat(amb.longitude.toString()),
          available: amb.available,
          assignedHospitalId: amb.assignedHospitalId,
          staffCount: amb.staffCount,
          responseTime: amb.responseTime,
        }));
      } catch (error) {
        console.error("[ClinicalGrid] Error getting fleet status:", error);
        return [];
      }
    }),

  /**
   * Dispatch nearest available ambulance to incident location
   */
  dispatchAmbulance: protectedProcedure
    .input(z.object({
      incidentLat: z.number().default(-1.292),
      incidentLon: z.number().default(36.822),
      incidentType: z.string().default("medical_emergency"),
      priority: z.enum(["low", "medium", "high", "critical"]).default("high"),
      patientName: z.string().optional(),
      patientAge: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        // Get available ambulances
        const availableAmbs = await db
          .select()
          .from(ambulances)
          .where(eq(ambulances.available, true));

        if (availableAmbs.length === 0) {
          return { success: false, error: "No ambulances available" };
        }

        // Find nearest ambulance
        const nearestAmb = availableAmbs.reduce((prev, curr) => {
          const prevDist = Math.hypot(
            parseFloat(prev.latitude.toString()) - input.incidentLat,
            parseFloat(prev.longitude.toString()) - input.incidentLon
          );
          const currDist = Math.hypot(
            parseFloat(curr.latitude.toString()) - input.incidentLat,
            parseFloat(curr.longitude.toString()) - input.incidentLon
          );
          return currDist < prevDist ? curr : prev;
        });

        // Get nearest hospital
        const targetHospital = await db.select().from(hospitals).limit(1);
        if (targetHospital.length === 0) {
          return { success: false, error: "No hospitals available" };
        }

        // Calculate ETA (simple: distance / average speed of 60 km/h)
        const distance = Math.hypot(
          parseFloat(nearestAmb.latitude.toString()) - input.incidentLat,
          parseFloat(nearestAmb.longitude.toString()) - input.incidentLon
        );
        const eta = Math.ceil((distance / 60) * 60); // minutes

        // Create dispatch record
        const emergencyCallId = nanoid();
        const dispatchRecord: InsertDispatchRecord = {
          emergencyCallId,
          userId: ctx.user.id,
          patientName: input.patientName,
          patientAge: input.patientAge,
          incidentType: input.incidentType,
          incidentLatitude: input.incidentLat.toString() as any,
          incidentLongitude: input.incidentLon.toString() as any,
          assignedAmbulanceId: nearestAmb.id,
          targetHospitalId: targetHospital[0].id,
          eta,
          status: "dispatched",
          priority: input.priority,
        };

        await db.insert(dispatchRecords).values(dispatchRecord);

        // Update ambulance status
        await db
          .update(ambulances)
          .set({
            available: false,
            assignedHospitalId: targetHospital[0].id,
            currentPatientId: emergencyCallId,
            updatedAt: new Date(),
          })
          .where(eq(ambulances.id, nearestAmb.id));

        return {
          success: true,
          emergencyCallId,
          assignedAmbulance: {
            id: nearestAmb.id,
            callSign: nearestAmb.callSign,
          },
          targetHospital: {
            id: targetHospital[0].id,
            name: targetHospital[0].name,
          },
          eta,
        };
      } catch (error) {
        console.error("[ClinicalGrid] Error dispatching ambulance:", error);
        return { success: false, error: "Dispatch failed" };
      }
    }),

  /**
   * Reset fleet status (for testing/demo)
   */
  resetFleet: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        // Reset all ambulances to available
        await db
          .update(ambulances)
          .set({
            available: true,
            assignedHospitalId: null,
            currentPatientId: null,
            updatedAt: new Date(),
          });

        return { success: true, message: "Fleet reset successfully" };
      } catch (error) {
        console.error("[ClinicalGrid] Error resetting fleet:", error);
        return { success: false, error: "Reset failed" };
      }
    }),

  /**
   * Get dispatch history for user
   */
  getDispatchHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const records = await db
          .select()
          .from(dispatchRecords)
          .where(eq(dispatchRecords.userId, ctx.user.id))
          .orderBy(sql`${dispatchRecords.createdAt} DESC`)
          .limit(input.limit)
          .offset(input.offset);

        return records.map(r => ({
          id: r.id,
          emergencyCallId: r.emergencyCallId,
          patientName: r.patientName,
          incidentType: r.incidentType,
          status: r.status,
          priority: r.priority,
          eta: r.eta,
          createdAt: r.createdAt,
        }));
      } catch (error) {
        console.error("[ClinicalGrid] Error getting dispatch history:", error);
        return [];
      }
    }),

  /**
   * Update dispatch status
   */
  updateDispatchStatus: protectedProcedure
    .input(z.object({
      emergencyCallId: z.string(),
      status: z.enum(["pending", "dispatched", "en_route", "arrived", "completed", "cancelled"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        await db
          .update(dispatchRecords)
          .set({
            status: input.status,
            notes: input.notes,
            updatedAt: new Date(),
          })
          .where(eq(dispatchRecords.emergencyCallId, input.emergencyCallId));

        return { success: true, message: "Status updated" };
      } catch (error) {
        console.error("[ClinicalGrid] Error updating dispatch status:", error);
        return { success: false, error: "Update failed" };
      }
    }),
});

export type ClinicalGridRouter = typeof clinicalGridRouter;
