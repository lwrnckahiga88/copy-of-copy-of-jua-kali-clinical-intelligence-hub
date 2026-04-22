import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  categorizeFile,
  convertToAgentModule,
  groupAgentsByCategory,
} from "./githubFetcher";
import * as hospitalApi from "./hospitalApi";

describe("GitHub Fetcher", () => {
  describe("categorizeFile", () => {
    it("should categorize NurseAI as Patient Management", () => {
      const result = categorizeFile("NurseAI.html");
      expect(result.category).toBe("Patient Management");
      expect(result.functionality).toContain("patient-monitoring");
    });

    it("should categorize pandemic files as Analytics & Epidemiology", () => {
      const result = categorizeFile("pandemicseird.html");
      expect(result.category).toBe("Analytics & Epidemiology");
      expect(result.functionality).toContain("disease-modeling");
    });

    it("should categorize workflow files as Workflow Management", () => {
      const result = categorizeFile("langflow-builder.html");
      expect(result.category).toBe("Workflow Management");
      expect(result.functionality).toContain("workflow-design");
    });

    it("should categorize genomics files as Genomics & Molecular", () => {
      const result = categorizeFile("Genomica.html");
      expect(result.category).toBe("Genomics & Molecular");
      expect(result.functionality).toContain("genetic-analysis");
    });

    it("should categorize lab files as Laboratory", () => {
      const result = categorizeFile("Chemworkbench.html");
      expect(result.category).toBe("Laboratory");
      expect(result.functionality).toContain("lab-testing");
    });

    it("should categorize validation files as Clinical Validation", () => {
      const result = categorizeFile("clinicalvalidation.html");
      expect(result.category).toBe("Clinical Validation");
      expect(result.functionality).toContain("data-validation");
    });

    it("should categorize monitoring files as Monitoring & Alerts", () => {
      const result = categorizeFile("netstreamfullstream.html");
      expect(result.category).toBe("Monitoring & Alerts");
      expect(result.functionality).toContain("real-time-monitoring");
    });

    it("should default to Clinical Tools for unknown files", () => {
      const result = categorizeFile("unknown-tool.html");
      expect(result.category).toBe("Clinical Tools");
      expect(result.functionality).toContain("general-clinical-support");
    });
  });

  describe("convertToAgentModule", () => {
    it("should convert GitHub file to agent module", () => {
      const file = {
        name: "NurseAI.html",
        path: "public/NurseAI.html",
        size: 1024,
        download_url: "https://raw.githubusercontent.com/...",
        type: "file",
      };

      const agent = convertToAgentModule(file);

      expect(agent.id).toBe("nurseai");
      expect(agent.name).toBe("NurseAI");
      expect(agent.category).toBe("Patient Management");
      expect(agent.htmlUrl).toBe(file.download_url);
      expect(agent.status).toBe("active");
    });

    it("should handle complex filenames", () => {
      const file = {
        name: "clinicalvalidationworkflowbuilderpro2.html",
        path: "public/clinicalvalidationworkflowbuilderpro2.html",
        size: 2048,
        download_url: "https://raw.githubusercontent.com/...",
        type: "file",
      };

      const agent = convertToAgentModule(file);

      expect(agent.id).toContain("clinical");
      expect(agent.name).toContain("clinical");
      expect(agent.category).toBe("Clinical Validation");
    });
  });

  describe("groupAgentsByCategory", () => {
    it("should group agents by category", () => {
      const agents = [
        {
          id: "nurse-ai",
          name: "NurseAI",
          description: "Patient monitoring",
          category: "Patient Management",
          htmlUrl: "https://...",
          functionality: [],
          status: "active" as const,
        },
        {
          id: "pandemic",
          name: "Pandemic SEIRD",
          description: "Disease modeling",
          category: "Analytics & Epidemiology",
          htmlUrl: "https://...",
          functionality: [],
          status: "active" as const,
        },
        {
          id: "nurse-ai-2",
          name: "NurseAI Advanced",
          description: "Advanced patient monitoring",
          category: "Patient Management",
          htmlUrl: "https://...",
          functionality: [],
          status: "active" as const,
        },
      ];

      const grouped = groupAgentsByCategory(agents);

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped["Patient Management"]).toHaveLength(2);
      expect(grouped["Analytics & Epidemiology"]).toHaveLength(1);
    });

    it("should handle empty agent list", () => {
      const grouped = groupAgentsByCategory([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });
  });
});

describe("Hospital API", () => {
  describe("getAllHospitals", () => {
    it("should return all hospitals", async () => {
      const hospitals = await hospitalApi.getAllHospitals();
      expect(hospitals.length).toBeGreaterThan(0);
      expect(hospitals[0]).toHaveProperty("id");
      expect(hospitals[0]).toHaveProperty("name");
      expect(hospitals[0]).toHaveProperty("status");
    });

    it("should return hospitals with required fields", async () => {
      const hospitals = await hospitalApi.getAllHospitals();
      hospitals.forEach((hospital) => {
        expect(hospital).toHaveProperty("id");
        expect(hospital).toHaveProperty("name");
        expect(hospital).toHaveProperty("location");
        expect(hospital).toHaveProperty("beds");
        expect(hospital).toHaveProperty("availableBeds");
        expect(hospital).toHaveProperty("status");
        expect(hospital).toHaveProperty("specialties");
      });
    });
  });

  describe("getHospitalById", () => {
    it("should return hospital by ID", async () => {
      const hospital = await hospitalApi.getHospitalById("hospital_001");
      expect(hospital).not.toBeNull();
      expect(hospital?.id).toBe("hospital_001");
      expect(hospital?.name).toBe("Central Medical Center");
    });

    it("should return null for non-existent hospital", async () => {
      const hospital = await hospitalApi.getHospitalById("non-existent");
      expect(hospital).toBeNull();
    });
  });

  describe("getHospitalsBySpecialty", () => {
    it("should return hospitals with specific specialty", async () => {
      const hospitals = await hospitalApi.getHospitalsBySpecialty("Emergency");
      expect(hospitals.length).toBeGreaterThan(0);
      hospitals.forEach((hospital) => {
        expect(hospital.specialties.some((s) => s.includes("Emergency"))).toBe(
          true
        );
      });
    });

    it("should return empty array for non-existent specialty", async () => {
      const hospitals = await hospitalApi.getHospitalsBySpecialty(
        "NonExistentSpecialty"
      );
      expect(hospitals).toHaveLength(0);
    });
  });

  describe("getHospitalsByStatus", () => {
    it("should return hospitals with specific status", async () => {
      const hospitals = await hospitalApi.getHospitalsByStatus("online");
      expect(hospitals.length).toBeGreaterThan(0);
      hospitals.forEach((hospital) => {
        expect(hospital.status).toBe("online");
      });
    });
  });

  describe("getHospitalsWithAvailableBeds", () => {
    it("should return hospitals with available beds", async () => {
      const hospitals = await hospitalApi.getHospitalsWithAvailableBeds(10);
      hospitals.forEach((hospital) => {
        expect(hospital.availableBeds).toBeGreaterThanOrEqual(10);
      });
    });

    it("should return all hospitals when minBeds is 0", async () => {
      const hospitals = await hospitalApi.getHospitalsWithAvailableBeds(0);
      expect(hospitals.length).toBeGreaterThan(0);
    });
  });

  describe("getNearestHospitals", () => {
    it("should return nearest hospitals by coordinates", async () => {
      const hospitals = await hospitalApi.getNearestHospitals(
        -1.2921,
        36.8219,
        3
      );
      expect(hospitals.length).toBeLessThanOrEqual(3);
      expect(hospitals.length).toBeGreaterThan(0);
    });

    it("should return hospitals sorted by distance", async () => {
      const hospitals = await hospitalApi.getNearestHospitals(
        -1.2921,
        36.8219,
        5
      );
      for (let i = 1; i < hospitals.length; i++) {
        const dist1 = (hospitals[i - 1] as any).distance;
        const dist2 = (hospitals[i] as any).distance;
        expect(dist1).toBeLessThanOrEqual(dist2);
      }
    });
  });

  describe("getHospitalStatistics", () => {
    it("should return hospital statistics", async () => {
      const stats = await hospitalApi.getHospitalStatistics();
      expect(stats).toHaveProperty("totalHospitals");
      expect(stats).toHaveProperty("totalBeds");
      expect(stats).toHaveProperty("totalAvailableBeds");
      expect(stats).toHaveProperty("onlineHospitals");
      expect(stats).toHaveProperty("offlineHospitals");
      expect(stats).toHaveProperty("averageOccupancy");

      expect(stats.totalHospitals).toBeGreaterThan(0);
      expect(stats.totalBeds).toBeGreaterThan(0);
      expect(stats.averageOccupancy).toBeGreaterThanOrEqual(0);
      expect(stats.averageOccupancy).toBeLessThanOrEqual(100);
    });
  });

  describe("updateHospitalAvailability", () => {
    it("should update hospital availability", async () => {
      const updated = await hospitalApi.updateHospitalAvailability(
        "hospital_001",
        100
      );
      expect(updated).not.toBeNull();
      expect(updated?.availableBeds).toBe(100);
    });

    it("should return null for non-existent hospital", async () => {
      const updated = await hospitalApi.updateHospitalAvailability(
        "non-existent",
        100
      );
      expect(updated).toBeNull();
    });
  });

  describe("updateHospitalStatus", () => {
    it("should update hospital status", async () => {
      const updated = await hospitalApi.updateHospitalStatus(
        "hospital_001",
        "offline"
      );
      expect(updated).not.toBeNull();
      expect(updated?.status).toBe("offline");
    });

    it("should return null for non-existent hospital", async () => {
      const updated = await hospitalApi.updateHospitalStatus(
        "non-existent",
        "offline"
      );
      expect(updated).toBeNull();
    });
  });
});
