/**
 * Hospital API
 * Provides dynamic hospital data loading from database or external sources
 */

import { z } from 'zod';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  beds: number;
  availableBeds: number;
  status: 'online' | 'offline' | 'limited';
  specialties: string[];
  latitude?: number;
  longitude?: number;
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * Mock hospital data - can be replaced with database queries
 */
const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'hospital_001',
    name: 'Central Medical Center',
    location: 'Downtown',
    beds: 250,
    availableBeds: 45,
    status: 'online',
    specialties: ['Emergency', 'Cardiology', 'Surgery', 'ICU'],
    latitude: -1.2921,
    longitude: 36.8219,
    contactEmail: 'info@centralmedical.com',
    contactPhone: '+254 20 1234567',
  },
  {
    id: 'hospital_002',
    name: 'St. Mary Hospital',
    location: 'Westside',
    beds: 180,
    availableBeds: 12,
    status: 'limited',
    specialties: ['Pediatrics', 'Obstetrics', 'General Medicine'],
    latitude: -1.2950,
    longitude: 36.8100,
    contactEmail: 'info@stmary.com',
    contactPhone: '+254 20 9876543',
  },
  {
    id: 'hospital_003',
    name: 'Trauma & Emergency Center',
    location: 'Highway 101',
    beds: 120,
    availableBeds: 8,
    status: 'online',
    specialties: ['Trauma', 'Emergency', 'Orthopedics'],
    latitude: -1.3100,
    longitude: 36.8400,
    contactEmail: 'info@trauma.com',
    contactPhone: '+254 20 5555555',
  },
  {
    id: 'hospital_004',
    name: 'Nairobi General Hospital',
    location: 'City Center',
    beds: 400,
    availableBeds: 78,
    status: 'online',
    specialties: ['General', 'Surgery', 'Internal Medicine', 'Neurology'],
    latitude: -1.2865,
    longitude: 36.8172,
    contactEmail: 'info@ngh.com',
    contactPhone: '+254 20 2222222',
  },
  {
    id: 'hospital_005',
    name: 'Kenyatta National Hospital',
    location: 'Upper Hill',
    beds: 500,
    availableBeds: 92,
    status: 'online',
    specialties: ['Oncology', 'Cardiology', 'Neurosurgery', 'Transplant'],
    latitude: -1.2800,
    longitude: 36.8050,
    contactEmail: 'info@knh.com',
    contactPhone: '+254 20 7777777',
  },
  {
    id: 'hospital_006',
    name: 'Aga Khan Hospital',
    location: 'Parklands',
    beds: 300,
    availableBeds: 55,
    status: 'online',
    specialties: ['Cardiology', 'Orthopedics', 'Gastroenterology'],
    latitude: -1.2600,
    longitude: 36.8300,
    contactEmail: 'info@agakhan.com',
    contactPhone: '+254 20 3333333',
  },
  {
    id: 'hospital_007',
    name: 'Coptic Hospital',
    location: 'Westlands',
    beds: 200,
    availableBeds: 38,
    status: 'online',
    specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
    latitude: -1.2700,
    longitude: 36.8000,
    contactEmail: 'info@coptic.com',
    contactPhone: '+254 20 4444444',
  },
  {
    id: 'hospital_008',
    name: 'Mater Hospital',
    location: 'Nairobi West',
    beds: 280,
    availableBeds: 62,
    status: 'online',
    specialties: ['Obstetrics', 'Pediatrics', 'General Surgery'],
    latitude: -1.3200,
    longitude: 36.7900,
    contactEmail: 'info@mater.com',
    contactPhone: '+254 20 6666666',
  },
  {
    id: 'hospital_009',
    name: 'Nairobi Hospital',
    location: 'Ngong Road',
    beds: 350,
    availableBeds: 71,
    status: 'online',
    specialties: ['Cardiology', 'Orthopedics', 'Urology'],
    latitude: -1.3050,
    longitude: 36.7850,
    contactEmail: 'info@nairobihosp.com',
    contactPhone: '+254 20 8888888',
  },
  {
    id: 'hospital_010',
    name: 'Siloam Hospital',
    location: 'Kileleshwa',
    beds: 220,
    availableBeds: 44,
    status: 'online',
    specialties: ['General Medicine', 'Surgery', 'Dermatology'],
    latitude: -1.2750,
    longitude: 36.7750,
    contactEmail: 'info@siloam.com',
    contactPhone: '+254 20 9999999',
  },
];

/**
 * Hospital schema for validation
 */
export const HospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  beds: z.number().positive(),
  availableBeds: z.number().nonnegative(),
  status: z.enum(['online', 'offline', 'limited']),
  specialties: z.array(z.string()),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export type ValidatedHospital = z.infer<typeof HospitalSchema>;

/**
 * Get all hospitals
 */
export async function getAllHospitals(): Promise<Hospital[]> {
  // TODO: Replace with database query
  // const hospitals = await db.select().from(hospitalsTable);
  // return hospitals;

  return MOCK_HOSPITALS;
}

/**
 * Get hospital by ID
 */
export async function getHospitalById(id: string): Promise<Hospital | null> {
  // TODO: Replace with database query
  // const hospital = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, id));
  // return hospital[0] || null;

  return MOCK_HOSPITALS.find((h) => h.id === id) || null;
}

/**
 * Get hospitals by specialty
 */
export async function getHospitalsBySpecialty(
  specialty: string
): Promise<Hospital[]> {
  // TODO: Replace with database query
  return MOCK_HOSPITALS.filter((h) =>
    h.specialties.some((s) =>
      s.toLowerCase().includes(specialty.toLowerCase())
    )
  );
}

/**
 * Get hospitals by status
 */
export async function getHospitalsByStatus(
  status: 'online' | 'offline' | 'limited'
): Promise<Hospital[]> {
  // TODO: Replace with database query
  return MOCK_HOSPITALS.filter((h) => h.status === status);
}

/**
 * Get hospitals with available beds
 */
export async function getHospitalsWithAvailableBeds(
  minBeds: number = 1
): Promise<Hospital[]> {
  // TODO: Replace with database query
  return MOCK_HOSPITALS.filter((h) => h.availableBeds >= minBeds);
}

/**
 * Get nearest hospitals by coordinates
 */
export async function getNearestHospitals(
  latitude: number,
  longitude: number,
  limit: number = 5
): Promise<Hospital[]> {
  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
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
  };

  const hospitalsWithDistance = MOCK_HOSPITALS
    .filter((h) => h.latitude && h.longitude)
    .map((h) => ({
      ...h,
      distance: calculateDistance(
        latitude,
        longitude,
        h.latitude!,
        h.longitude!
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return hospitalsWithDistance;
}

/**
 * Update hospital availability
 */
export async function updateHospitalAvailability(
  id: string,
  availableBeds: number
): Promise<Hospital | null> {
  // TODO: Replace with database update
  const hospital = MOCK_HOSPITALS.find((h) => h.id === id);
  if (hospital) {
    hospital.availableBeds = availableBeds;
    return hospital;
  }
  return null;
}

/**
 * Update hospital status
 */
export async function updateHospitalStatus(
  id: string,
  status: 'online' | 'offline' | 'limited'
): Promise<Hospital | null> {
  // TODO: Replace with database update
  const hospital = MOCK_HOSPITALS.find((h) => h.id === id);
  if (hospital) {
    hospital.status = status;
    return hospital;
  }
  return null;
}

/**
 * Get hospital statistics
 */
export async function getHospitalStatistics(): Promise<{
  totalHospitals: number;
  totalBeds: number;
  totalAvailableBeds: number;
  onlineHospitals: number;
  offlineHospitals: number;
  averageOccupancy: number;
}> {
  const hospitals = await getAllHospitals();

  const totalBeds = hospitals.reduce((sum, h) => sum + h.beds, 0);
  const totalAvailableBeds = hospitals.reduce((sum, h) => sum + h.availableBeds, 0);
  const onlineHospitals = hospitals.filter((h) => h.status === 'online').length;
  const offlineHospitals = hospitals.filter((h) => h.status === 'offline').length;

  return {
    totalHospitals: hospitals.length,
    totalBeds,
    totalAvailableBeds,
    onlineHospitals,
    offlineHospitals,
    averageOccupancy: ((totalBeds - totalAvailableBeds) / totalBeds) * 100,
  };
}
