/**
 * Agent Framework Types
 * Defines the core types for the agent-based architecture
 */

/**
 * Structured Component Graph
 * Represents a component hierarchy parsed from HTML
 */
export interface ComponentNode {
  id: string;
  type: string; // React component type (e.g., "Card", "Button", "Input")
  props: Record<string, unknown>;
  children?: ComponentNode[];
  hooks?: AgentHook[];
  actions?: RuntimeAction[];
}

/**
 * Agent Hook
 * Enables live data updates and state management in agents
 */
export interface AgentHook {
  id: string;
  type: "useData" | "useAction" | "useSubscription" | "useEffect";
  config: Record<string, unknown>;
  dependencies?: string[];
}

/**
 * Runtime Action
 * Defines executable actions within an agent
 */
export interface RuntimeAction {
  id: string;
  name: string;
  type: "mutation" | "query" | "intent";
  handler: string; // Function name or intent type
  params?: Record<string, unknown>;
}

/**
 * Agent Definition
 * Complete definition of an agent module
 */
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  source: AgentSource;
  componentGraph: ComponentNode;
  metadata: AgentMetadata;
  permissions: AgentPermissions;
  lifecycle: AgentLifecycle;
}

/**
 * Agent Source
 * Where the agent comes from (GitHub, local, etc.)
 */
export interface AgentSource {
  type: "github" | "local" | "remote";
  repository?: string;
  path: string;
  branch?: string;
  commit?: string;
  lastFetched?: number;
  etag?: string;
}

/**
 * Agent Metadata
 * Additional information about the agent
 */
export interface AgentMetadata {
  author?: string;
  tags?: string[];
  category?: string;
  icon?: string;
  thumbnail?: string;
  documentation?: string;
  dependencies?: string[];
}

/**
 * Agent Permissions
 * Access control for agent execution
 */
export interface AgentPermissions {
  requiredRole: "user" | "admin" | "clinician";
  canAccessPatientData: boolean;
  canModifyRecords: boolean;
  canExecuteActions: boolean;
  allowedIntents: string[];
}

/**
 * Agent Lifecycle
 * Lifecycle hooks for agent execution
 */
export interface AgentLifecycle {
  onMount?: string;
  onUpdate?: string;
  onUnmount?: string;
  onError?: string;
}

/**
 * Agent State
 * Runtime state of an agent instance
 */
export interface AgentState {
  agentId: string;
  instanceId: string;
  status: "idle" | "loading" | "active" | "error" | "suspended";
  data: Record<string, unknown>;
  errors: AgentError[];
  lastUpdated: number;
  executionCount: number;
}

/**
 * Agent Error
 * Error information from agent execution
 */
export interface AgentError {
  id: string;
  code: string;
  message: string;
  timestamp: number;
  stack?: string;
  context?: Record<string, unknown>;
}

/**
 * Agent Intent
 * Intent routed through Jarvis to an agent
 */
export interface AgentIntent {
  id: string;
  type: string;
  agentId: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Agent Intent Response
 * Response from agent intent execution
 */
export interface AgentIntentResponse {
  id: string;
  intentId: string;
  agentId: string;
  status: "success" | "error" | "pending";
  data?: Record<string, unknown>;
  error?: AgentError;
  executionTime: number;
}

/**
 * Agent Registry Entry
 * Entry in the StudioOS registry
 */
export interface AgentRegistryEntry {
  id: string;
  definition: AgentDefinition;
  state: AgentState;
  lastSync: number;
  cached: boolean;
}

/**
 * Agent Execution Context
 * Context passed to agent hooks and actions
 */
export interface AgentExecutionContext {
  agentId: string;
  instanceId: string;
  user: {
    id: number;
    role: "user" | "admin";
  };
  state: AgentState;
  emit: (event: string, data: unknown) => void;
  updateState: (updates: Partial<Record<string, unknown>>) => void;
  executeIntent: (intent: AgentIntent) => Promise<AgentIntentResponse>;
}

/**
 * Agent Sandbox
 * Sandbox environment for safe agent execution
 */
export interface AgentSandbox {
  agentId: string;
  instanceId: string;
  context: AgentExecutionContext;
  execute: (action: RuntimeAction) => Promise<unknown>;
  cleanup: () => Promise<void>;
}

/**
 * UI Compilation Result
 * Result of HTML-to-component compilation
 */
export interface UICompilationResult {
  success: boolean;
  componentGraph?: ComponentNode;
  errors?: Array<{
    line?: number;
    column?: number;
    message: string;
  }>;
  warnings?: string[];
}

/**
 * Agent Sync Status
 * Status of agent synchronization with GitHub
 */
export interface AgentSyncStatus {
  agentId: string;
  status: "synced" | "syncing" | "out-of-date" | "error";
  lastSync: number;
  nextSync: number;
  error?: string;
  version: string;
}
