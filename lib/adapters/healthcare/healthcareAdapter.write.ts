/**
 * juA.kali World Runtime — Healthcare Adapter Write() Action Space
 *
 * Full discriminated union of all actions an RL agent can dispatch
 * through HealthcareAdapter.write().
 *
 * Safety gate stages:
 *   1. Allowlist         — only permitted action types execute
 *   2. Approval queue    — high-consequence actions require human sign-off
 *   3. Dry-run mode      — log without executing (used during RL training)
 */

// ─── Action types ─────────────────────────────────────────────────────────────

export type HealthcareAction =
  | RestockOrderAction
  | FlagShortageAction
  | AdjustStaffingAction
  | EscalateAlertAction
  | TransferPatientAction
  | MpesaPaymentAction

export interface RestockOrderAction {
  type: 'restock_order'
  drug_id: string
  qty: number
  supplier_phone: string
  amount: number               // KES
  reference: string
  urgency: 'routine' | 'urgent' | 'emergency'
}

export interface FlagShortageAction {
  type: 'flag_shortage'
  drug_id: string
  days_remaining: number
  ward_id?: string
}

export interface AdjustStaffingAction {
  type: 'adjust_staffing'
  ward_id: string
  role: 'nurse' | 'doctor' | 'porter' | 'pharmacist'
  delta_headcount: number      // positive = add, negative = reduce
  shift_id: string
  justification: string        // required for audit trail
}

export interface EscalateAlertAction {
  type: 'escalate_alert'
  level: 'green' | 'amber' | 'red'
  ward_id: string
  message: string
  notify_county: boolean       // escalate to CountyHealthState
}

export interface TransferPatientAction {
  type: 'transfer_patient'
  patient_id: string
  from_ward: string
  to_ward: string
  priority: 1 | 2 | 3         // 1 = critical, 3 = routine
  reason: string
}

export interface MpesaPaymentAction {
  type: 'mpesa_payment'
  phone: string
  amount: number               // KES
  reference: string
  payment_type: 'restock' | 'sha_enrollment' | 'bond_redemption'
}

// ─── Safety gate ─────────────────────────────────────────────────────────────

/**
 * Returns true if action requires human approval before execution.
 * Used by HealthcareAdapter.write() to route to approval queue.
 */
export function requiresApproval(action: HealthcareAction): boolean {
  switch (action.type) {
    case 'restock_order':
      return action.urgency === 'emergency'
    case 'transfer_patient':
      return action.priority === 1
    case 'escalate_alert':
      return action.level === 'red'
    case 'mpesa_payment':
      return action.amount > 50_000    // KES 50k threshold
    case 'adjust_staffing':
      return Math.abs(action.delta_headcount) > 3
    default:
      return false
  }
}

/**
 * Default allowlist for production deployment.
 * Start conservative — expand as agent confidence is validated.
 *
 * Stage 1 (observation):  []                         — no writes
 * Stage 2 (assisted):     ['flag_shortage']           — alerts only
 * Stage 3 (supervised):   + 'escalate_alert'          — with human review
 * Stage 4 (autonomous):   + 'restock_order' etc       — gated by requiresApproval
 */
export const PRODUCTION_ALLOWLIST: HealthcareAction['type'][] = [
  'flag_shortage',
  'escalate_alert',
]

export const SUPERVISED_ALLOWLIST: HealthcareAction['type'][] = [
  'flag_shortage',
  'escalate_alert',
  'restock_order',
  'adjust_staffing',
  'transfer_patient',
  'mpesa_payment',
]

// ─── Approval queue (in-memory stub — wire to County Portal in production) ───

export interface PendingApproval {
  id: string
  action: HealthcareAction
  queued_at: number
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
}

export class ApprovalQueue {
  private queue: PendingApproval[] = []

  async push(action: HealthcareAction): Promise<string> {
    const id = `approval_${Date.now()}_${Math.random().toString(36).slice(2)}`
    this.queue.push({ id, action, queued_at: Date.now(), status: 'pending' })
    // TODO: notify County Portal via WebSocket / SMS
    return id
  }

  async approve(id: string, reviewed_by: string): Promise<PendingApproval | null> {
    const item = this.queue.find(a => a.id === id)
    if (!item) return null
    item.status = 'approved'
    item.reviewed_by = reviewed_by
    return item
  }

  getPending(): PendingApproval[] {
    return this.queue.filter(a => a.status === 'pending')
  }
}
