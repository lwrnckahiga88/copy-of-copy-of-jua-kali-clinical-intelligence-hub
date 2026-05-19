import { useEffect, useRef, useCallback } from 'react';

/**
 * NurseAI Tab Synchronization Hook
 * Enables real-time synchronization of NurseAI data across all agent tabs
 */

interface NurseAISyncMessage {
  type: 'nursai-sync' | 'nursai-update' | 'nursai-query';
  agentId: string;
  data?: any;
  timestamp: number;
}

interface NurseAISyncState {
  patientData?: any;
  activeAlerts?: any[];
  recommendations?: any[];
  lastUpdate?: number;
}

const SYNC_CHANNEL_NAME = 'nursai-sync-channel';
const SYNC_STORAGE_KEY = 'nursai-sync-state';

export function useNurseAISync(agentId: string) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const syncStateRef = useRef<NurseAISyncState>({});

  // Initialize BroadcastChannel for cross-tab communication
  useEffect(() => {
    try {
      broadcastChannelRef.current = new BroadcastChannel(SYNC_CHANNEL_NAME);

      broadcastChannelRef.current.onmessage = (event) => {
        const message: NurseAISyncMessage = event.data;

        if (message.type === 'nursai-update') {
          // Update local sync state
          syncStateRef.current = {
            ...syncStateRef.current,
            ...message.data,
            lastUpdate: message.timestamp,
          };

          // Persist to localStorage for persistence across sessions
          localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncStateRef.current));

          // Notify iframe of update
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: 'nursai-sync-update',
                data: syncStateRef.current,
              },
              '*'
            );
          }
        }
      };

      // Restore sync state from localStorage
      const savedState = localStorage.getItem(SYNC_STORAGE_KEY);
      if (savedState) {
        syncStateRef.current = JSON.parse(savedState);
      }

      return () => {
        broadcastChannelRef.current?.close();
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported, falling back to localStorage', error);
    }
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;

      const message = event.data;

      if (message.type === 'nursai-data-update') {
        // Update sync state from iframe
        syncStateRef.current = {
          ...syncStateRef.current,
          ...message.data,
          lastUpdate: Date.now(),
        };

        // Broadcast to other tabs
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'nursai-update',
            agentId,
            data: syncStateRef.current,
            timestamp: Date.now(),
          });
        }

        // Persist to localStorage
        localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncStateRef.current));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [agentId]);

  // Function to broadcast NurseAI data to all agents
  const broadcastNurseAIData = useCallback((data: any) => {
    syncStateRef.current = {
      ...syncStateRef.current,
      ...data,
      lastUpdate: Date.now(),
    };

    // Broadcast to other tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'nursai-update',
        agentId,
        data: syncStateRef.current,
        timestamp: Date.now(),
      });
    }

    // Notify iframe
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'nursai-sync-update',
          data: syncStateRef.current,
        },
        '*'
      );
    }

    // Persist to localStorage
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncStateRef.current));
  }, [agentId]);

  // Function to query NurseAI data from all agents
  const queryNurseAIData = useCallback((): NurseAISyncState => {
    return syncStateRef.current;
  }, []);

  // Function to sync iframe with current state
  const syncIframeWithState = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'nursai-sync-init',
          data: syncStateRef.current,
        },
        '*'
      );
    }
  }, []);

  return {
    iframeRef,
    broadcastNurseAIData,
    queryNurseAIData,
    syncIframeWithState,
    syncState: syncStateRef.current,
  };
}

/**
 * Helper function for PWAs to register NurseAI sync listener
 * Call this from within iframe/PWA to enable sync
 */
export function registerNurseAISyncListener(onDataUpdate?: (data: NurseAISyncState) => void) {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'nursai-sync-update' || event.data.type === 'nursai-sync-init') {
      if (onDataUpdate) {
        onDataUpdate(event.data.data);
      }
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}

/**
 * Helper function for PWAs to send NurseAI data updates
 * Call this from within iframe/PWA to update sync state
 */
export function sendNurseAIDataUpdate(data: any) {
  window.parent.postMessage(
    {
      type: 'nursai-data-update',
      data,
    },
    '*'
  );
}
