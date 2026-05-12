import { useEffect, useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";

export interface AgentSyncState {
  agentId: string;
  status: "active" | "inactive" | "error" | "loading";
  data: Record<string, unknown>;
  lastUpdate: number;
  error?: string;
}

/**
 * Hook for subscribing to agent updates
 * Handles real-time data synchronization
 */
export function useAgentSync(agentId: string) {
  const [state, setState] = useState<AgentSyncState>({
    agentId,
    status: "loading",
    data: {},
    lastUpdate: 0,
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const subscriptionRef = useRef<(() => void) | null>(null);

  // Subscribe to agent updates
  useEffect(() => {
    if (!agentId) return;

    // Simulate subscription (in real app, would connect to WebSocket)
    const subscribe = async () => {
      try {
        setState((prev) => ({ ...prev, status: "loading" }));

        // Fetch initial data
        const response = await fetch(`/api/agents/${agentId}/sync`);
        if (!response.ok) throw new Error("Failed to fetch agent data");

        const data = await response.json();
        setState({
          agentId,
          status: "active",
          data: data.data || {},
          lastUpdate: Date.now(),
        });

        setIsSubscribed(true);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, [agentId]);

  const updateData = useCallback(
    (newData: Record<string, unknown>) => {
      setState((prev) => ({
        ...prev,
        data: { ...prev.data, ...newData },
        lastUpdate: Date.now(),
      }));
    },
    []
  );

  const setStatus = useCallback(
    (status: AgentSyncState["status"]) => {
      setState((prev) => ({ ...prev, status }));
    },
    []
  );

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      status: "error",
      error,
    }));
  }, []);

  return {
    state,
    isSubscribed,
    updateData,
    setStatus,
    setError,
  };
}

/**
 * Hook for syncing hospital data
 */
export function useHospitalSync(hospitalId: string) {
  const [hospitalData, setHospitalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: hospital, isLoading } = trpc.hospitals.getById.useQuery(
    { id: hospitalId }
  );

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else if (hospital) {
      setHospitalData(hospital as any);
      setLoading(false);
      setError(null);
    }
  }, [hospital, isLoading]);

  const updateAvailability = useCallback(
    async (availableBeds: number) => {
      try {
        // Call mutation to update hospital availability
        // This would be implemented in the tRPC router
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      }
    },
    []
  );

  return {
    hospitalData: hospitalData || hospital,
    loading,
    error,
    updateAvailability,
  } as const;
}

/**
 * Hook for syncing multiple agents
 */
export function useMultiAgentSync(agentIds: string[]) {
  const [agentStates, setAgentStates] = useState<Record<string, AgentSyncState>>(
    {}
  );

  useEffect(() => {
    // Initialize states for all agents
    const initialStates: Record<string, AgentSyncState> = {};
    for (const id of agentIds) {
      initialStates[id] = {
        agentId: id,
        status: "loading",
        data: {},
        lastUpdate: 0,
      };
    }
    setAgentStates(initialStates);
  }, [agentIds]);

  const updateAgentState = useCallback(
    (agentId: string, newState: Partial<AgentSyncState>) => {
      setAgentStates((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          ...newState,
          lastUpdate: Date.now(),
        },
      }));
    },
    []
  );

  return {
    agentStates,
    updateAgentState,
  };
}

/**
 * Hook for polling agent data at intervals
 */
export function useAgentPolling(
  agentId: string,
  interval: number = 5000
) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/agents/${agentId}/data`);
        if (!response.ok) throw new Error("Failed to fetch agent data");

        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        timeoutId = setTimeout(poll, interval);
      }
    };

    poll();

    return () => clearTimeout(timeoutId);
  }, [agentId, interval]);

  return { data, loading, error };
}
