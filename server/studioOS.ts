/**
 * StudioOS — National Health Intelligence Grid
 * Invisible server-side intelligence layer powering the Jua Kali Clinical Hub
 * Exposes four core engines: SwarmRouter, GeoRouter, AmbulanceRouter, TriageEngine
 */

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  load: number;
}

export interface Ambulance {
  id: string;
  callSign: string;
  lat: number;
  lon: number;
  available: boolean;
}

export interface TriageInput {
  heartRate: number;
  systolicBP: number;
  spo2: number;
}

export interface TriageResult {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  flags: string[];
  recommendation: string;
}

// Nairobi hospital network (6 facilities)
const hospitals: Hospital[] = [
  {
    id: 'H1',
    name: 'Nairobi Central Hospital',
    lat: -1.286,
    lon: 36.817,
    load: 30,
  },
  {
    id: 'H2',
    name: 'Kenyatta National Hospital',
    lat: -1.301,
    lon: 36.806,
    load: 85,
  },
  {
    id: 'H3',
    name: 'Aga Khan University Hospital',
    lat: -1.263,
    lon: 36.821,
    load: 60,
  },
  {
    id: 'H4',
    name: 'Mbagathi District Hospital',
    lat: -1.318,
    lon: 36.784,
    load: 40,
  },
  {
    id: 'H5',
    name: 'MP Shah Hospital',
    lat: -1.275,
    lon: 36.835,
    load: 55,
  },
  {
    id: 'H6',
    name: "Gertrude's Children Hospital",
    lat: -1.295,
    lon: 36.795,
    load: 45,
  },
];

// Ambulance fleet (3 units)
let ambulances: Ambulance[] = [
  { id: 'A1', callSign: 'NAIROBI-1', lat: -1.28, lon: 36.81, available: true },
  { id: 'A2', callSign: 'NAIROBI-2', lat: -1.31, lon: 36.8, available: true },
  { id: 'A3', callSign: 'NAIROBI-3', lat: -1.265, lon: 36.825, available: true },
];

// Haversine distance calculation (km)
function distance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * SwarmRouter: Rank hospitals by ascending occupancy load
 */
export const SwarmRouter = {
  run(): Array<Hospital & { rank: number; status: string }> {
    return hospitals
      .map((h, idx) => ({
        ...h,
        rank: idx + 1,
        status:
          h.load >= 80 ? 'critical' : h.load >= 60 ? 'busy' : 'available',
      }))
      .sort((a, b) => a.load - b.load);
  },
};

/**
 * GeoRouter: Score hospitals by proximity + normalized load
 * Origin: Nairobi CBD (default -1.292, 36.822)
 */
export const GeoRouter = {
  run(
    lat: number = -1.292,
    lon: number = 36.822
  ): Array<
    Hospital & {
      distanceKm: number;
      score: number;
      rank: number;
    }
  > {
    return hospitals
      .map((h) => {
        const dist = distance(lat, lon, h.lat, h.lon);
        const normalizedLoad = h.load / 100;
        const score = dist + normalizedLoad;
        return {
          ...h,
          distanceKm: dist,
          score,
          rank: 0,
        };
      })
      .sort((a, b) => a.score - b.score)
      .map((h, idx) => ({
        ...h,
        rank: idx + 1,
      }));
  },
};

/**
 * AmbulanceRouter: Assign nearest available unit to highest-load hospital
 */
export const AmbulanceRouter = {
  dispatch(): {
    targetHospital: Hospital | null;
    assignedAmbulance: Ambulance | null;
    eta: number;
  } {
    // Find highest-load hospital
    const target = hospitals.reduce((max, h) =>
      h.load > max.load ? h : max
    );

    // Find nearest available ambulance
    let nearest: Ambulance | null = null;
    let minDist = Infinity;

    for (const amb of ambulances) {
      if (!amb.available) continue;
      const dist = distance(amb.lat, amb.lon, target.lat, target.lon);
      if (dist < minDist) {
        minDist = dist;
        nearest = amb;
      }
    }

    // Mark as dispatched
    if (nearest) {
      nearest.available = false;
    }

    // ETA: assume 40 km/h average speed
    const eta = nearest ? Math.round((minDist / 40) * 60) : 0;

    return {
      targetHospital: target,
      assignedAmbulance: nearest,
      eta,
    };
  },

  getFleetStatus(): Ambulance[] {
    return ambulances;
  },

  reset(): void {
    ambulances.forEach((a) => {
      a.available = true;
    });
  },
};

/**
 * TriageEngine: Compute severity score from vital signs
 * Scoring: HR abnormal +2, Hypotension +3, Hypoxaemia +4
 */
export const TriageEngine = {
  compute(input: TriageInput): TriageResult {
    let score = 0;
    const flags: string[] = [];

    // Heart rate: abnormal if <50 or >120 bpm
    if (input.heartRate < 50 || input.heartRate > 120) {
      score += 2;
      if (input.heartRate > 120) {
        flags.push(`Tachycardia (HR ${input.heartRate} bpm)`);
      } else {
        flags.push(`Bradycardia (HR ${input.heartRate} bpm)`);
      }
    }

    // Systolic BP: hypotension if <90 mmHg
    if (input.systolicBP < 90) {
      score += 3;
      flags.push(`Hypotension (SBP ${input.systolicBP} mmHg)`);
    }

    // SpO2: hypoxaemia if <92%
    if (input.spo2 < 92) {
      score += 4;
      flags.push(`Hypoxaemia (SpO₂ ${input.spo2}%)`);
    }

    // Determine level
    let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score >= 9) {
      level = 'CRITICAL';
    } else if (score >= 6) {
      level = 'HIGH';
    } else if (score >= 3) {
      level = 'MODERATE';
    }

    // Clinical recommendation
    let recommendation = 'Routine observation.';
    if (level === 'CRITICAL') {
      recommendation =
        'Immediate resuscitation. Alert crash team. Prepare ICU bed.';
    } else if (level === 'HIGH') {
      recommendation =
        'Urgent assessment. Continuous monitoring. Prepare for intervention.';
    } else if (level === 'MODERATE') {
      recommendation =
        'Close monitoring. Prepare for escalation if deterioration.';
    }

    return {
      score,
      level,
      flags,
      recommendation,
    };
  },
};
