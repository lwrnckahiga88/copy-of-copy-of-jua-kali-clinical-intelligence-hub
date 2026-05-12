import { useEffect, useState, useCallback, useRef } from "react";

export interface SSEUpdate {
  type: string;
  data: unknown;
}

export interface SSESyncState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastUpdate: number;
  updateCount: number;
}

/**
 * Hook for subscribing to real-time agent updates via SSE
 */
export function useSSESync(agentId: string) {
  const [state, setState] = useState<SSESyncState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastUpdate: 0,
    updateCount: 0,
  });

  const [updates, setUpdates] = useState<SSEUpdate[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (!agentId) return;

    setState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const eventSource = new EventSource(`/api/agents/${agentId}/sync`);

      eventSource.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const update: SSEUpdate = JSON.parse(event.data);
          setUpdates((prev) => [...prev, update]);
          setState((prev) => ({
            ...prev,
            lastUpdate: Date.now(),
            updateCount: prev.updateCount + 1,
          }));
        } catch (error) {
          console.error("Failed to parse SSE message:", error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: "Connection lost",
        }));

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current);
        } else {
          setState((prev) => ({
            ...prev,
            error: `Failed to reconnect after ${maxReconnectAttempts} attempts`,
          }));
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [agentId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [agentId, connect, disconnect]);

  return {
    state,
    updates,
    clearUpdates,
    reconnect: connect,
    disconnect,
  };
}

/**
 * Hook for subscribing to multiple agents via SSE
 */
export function useMultiSSESync(agentIds: string[]) {
  const [allUpdates, setAllUpdates] = useState<Record<string, SSEUpdate[]>>({});
  const [connectionStates, setConnectionStates] = useState<
    Record<string, SSESyncState>
  >({});

  const eventSourcesRef = useRef<Record<string, EventSource>>({});

  useEffect(() => {
    const connect = (agentId: string) => {
      try {
        const eventSource = new EventSource(`/api/agents/${agentId}/sync`);

        eventSource.onopen = () => {
          setConnectionStates((prev) => ({
            ...prev,
            [agentId]: {
              isConnected: true,
              isConnecting: false,
              error: null,
              lastUpdate: Date.now(),
              updateCount: 0,
            },
          }));
        };

        eventSource.onmessage = (event) => {
          try {
            const update: SSEUpdate = JSON.parse(event.data);
            setAllUpdates((prev) => ({
              ...prev,
              [agentId]: [...(prev[agentId] || []), update],
            }));
            setConnectionStates((prev) => ({
              ...prev,
              [agentId]: {
                ...prev[agentId],
                lastUpdate: Date.now(),
                updateCount: (prev[agentId]?.updateCount || 0) + 1,
              },
            }));
          } catch (error) {
            console.error(`Failed to parse SSE message for ${agentId}:`, error);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          setConnectionStates((prev) => ({
            ...prev,
            [agentId]: {
              ...prev[agentId],
              isConnected: false,
              error: "Connection lost",
            },
          }));
        };

        eventSourcesRef.current[agentId] = eventSource;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setConnectionStates((prev) => ({
          ...prev,
          [agentId]: {
            isConnected: false,
            isConnecting: false,
            error: errorMessage,
            lastUpdate: 0,
            updateCount: 0,
          },
        }));
      }
    };

    // Connect to all agents
    for (const agentId of agentIds) {
      if (!eventSourcesRef.current[agentId]) {
        connect(agentId);
      }
    }

    return () => {
      // Disconnect all agents
      for (const eventSource of Object.values(eventSourcesRef.current)) {
        eventSource.close();
      }
      eventSourcesRef.current = {};
    };
  }, [agentIds]);

  return {
    allUpdates,
    connectionStates,
  };
}
