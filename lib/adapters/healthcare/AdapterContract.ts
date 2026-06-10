/**
 * juA.kali World Runtime — Base Adapter Contract
 * Implements Willcox Challenge 1: predictive window via forecast()
 */

export interface WorldEvent<T = unknown> {
  type: string
  payload: T
  ts: number
  source: string
}

export interface Action {
  type: string
  [key: string]: unknown
}

export interface AdapterHealth {
  status: 'healthy' | 'degraded' | 'offline'
  details: Record<string, unknown>
  checkedAt: number
}

export interface ForecastResult<T = unknown> {
  horizon_minutes: number
  predicted_state: T
  confidence: number          // 0–1
  model: string               // e.g. 'lstm_v1', 'arima', 'physics_prior'
}

/**
 * Every adapter that plugs into the juA.kali World Runtime
 * must implement this contract.
 *
 * connect()  — establish connection to underlying data source
 * read()     — return current world events (normalized)
 * forecast() — return predicted state N minutes ahead (Willcox #1)
 * write()    — dispatch agent actions to real systems
 * health()   — return liveness + data quality status
 */
export interface Adapter<TState = unknown, TAction extends Action = Action> {
  connect(): Promise<void>
  read(): Promise<WorldEvent<TState>[]>
  forecast(horizon_minutes: number): Promise<ForecastResult<TState>>
  write(actions: TAction[]): Promise<void>
  health(): Promise<AdapterHealth>
}
