/**
 * juA.kali World Runtime — WorldHealthState
 *
 * Willcox fixes applied:
 *   #2 — every field carries a confidence score (UQ)
 *   #3 — multi-scale hierarchy: patient → ward → facility → county → national
 */

// ─── UQ wrapper ────────────────────────────────────────────────────────────────

export interface Measured<T> {
  value: T
  confidence: number          // 0–1  (1 = fully trusted, 0 = stale/anomalous)
  source: string              // e.g. 'fhir_r4', 'hl7_feed', 'cached'
  staleness_seconds: number   // how old is this reading
}

// ─── Scale: Patient ────────────────────────────────────────────────────────────

export interface PatientState {
  patient_id: string
  ward_id: string
  acuity: Measured<1 | 2 | 3 | 4 | 5>   // 1=critical, 5=stable
  pending_labs: Measured<number>
  active_medications: Measured<string[]>
  imaging_pending: Measured<boolean>
}

// ─── Scale: Ward ───────────────────────────────────────────────────────────────

export interface WardState {
  ward_id: string
  ward_type: 'icu' | 'general' | 'maternity' | 'paediatric' | 'emergency'
  bed_occupancy: Measured<number>         // 0–1 ratio
  nurse_headcount: Measured<number>
  doctor_headcount: Measured<number>
  drug_stock: Measured<Record<string, number>>   // drug_id → days_remaining
  alert_level: Measured<'green' | 'amber' | 'red'>
  patients: PatientState[]
}

// ─── Scale: Facility ───────────────────────────────────────────────────────────

export interface FacilityState {
  facility_id: string
  facility_name: string
  patient_count: Measured<number>
  icu_occupancy: Measured<number>         // 0–1 ratio
  oxygen_supply_percent: Measured<number>
  pending_labs: Measured<number>
  overall_alert: Measured<'green' | 'amber' | 'red'>
  wards: WardState[]
}

// ─── Scale: County ─────────────────────────────────────────────────────────────

export interface CountyHealthState {
  county_id: string                       // Kenya county code
  county_name: string
  total_patients: Measured<number>
  icu_capacity_used: Measured<number>     // 0–1 across all facilities
  supply_chain_status: Measured<'normal' | 'stressed' | 'critical'>
  sha_shif_enrollments_active: Measured<number>
  facilities: FacilityState[]
}

// ─── Scale: National ───────────────────────────────────────────────────────────

export interface NationalHealthState {
  country: 'KE'
  snapshot_ts: number
  counties: CountyHealthState[]
  aggregate_alert: Measured<'green' | 'amber' | 'red'>
  treasury_bond_utilization: Measured<number>   // % of health bond pool deployed
}

// ─── Top-level WorldHealthState (what read() emits) ───────────────────────────

export type WorldHealthState = FacilityState   // default scope: single facility

// ─── Scope selector (for multi-scale reads) ───────────────────────────────────

export type StateScope =
  | { level: 'patient';  patient_id: string }
  | { level: 'ward';     ward_id: string }
  | { level: 'facility'; facility_id: string }
  | { level: 'county';   county_id: string }
  | { level: 'national' }
