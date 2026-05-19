import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerNurseAISyncListener, sendNurseAIDataUpdate } from './useNurseAISync';

describe('NurseAI Synchronization', () => {
  let mockPostMessage: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.parent.postMessage
    mockPostMessage = vi.fn();
    Object.defineProperty(window, 'parent', {
      value: { postMessage: mockPostMessage },
      writable: true,
    });

    // Mock window event listeners
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('sendNurseAIDataUpdate', () => {
    it('should send data update to parent window', () => {
      const testData = {
        patientData: { id: '123', name: 'John Doe' },
        activeAlerts: ['Alert 1', 'Alert 2'],
      };

      sendNurseAIDataUpdate(testData);

      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          type: 'nursai-data-update',
          data: testData,
        },
        '*'
      );
    });

    it('should handle empty data', () => {
      sendNurseAIDataUpdate({});

      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          type: 'nursai-data-update',
          data: {},
        },
        '*'
      );
    });

    it('should handle complex nested data structures', () => {
      const complexData = {
        patientData: {
          id: '456',
          vitals: {
            heartRate: 72,
            bloodPressure: '120/80',
            temperature: 37.5,
          },
          medications: [
            { name: 'Aspirin', dosage: '100mg' },
            { name: 'Lisinopril', dosage: '10mg' },
          ],
        },
        recommendations: [
          {
            agent: 'OncoAI',
            recommendation: 'Consider CT scan',
            confidence: 0.95,
          },
        ],
      };

      sendNurseAIDataUpdate(complexData);

      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          type: 'nursai-data-update',
          data: complexData,
        },
        '*'
      );
    });
  });

  describe('registerNurseAISyncListener', () => {
    it('should register message event listener', () => {
      const onDataUpdate = vi.fn();
      registerNurseAISyncListener(onDataUpdate);

      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should call onDataUpdate callback when sync message received', () => {
      const onDataUpdate = vi.fn();
      registerNurseAISyncListener(onDataUpdate);

      // Get the registered listener
      const listenerCall = mockAddEventListener.mock.calls[0];
      const listener = listenerCall[1] as EventListener;

      // Simulate receiving a sync message
      const testData = { patientData: { id: '789' } };
      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: testData,
        },
      });

      listener(event as any);

      expect(onDataUpdate).toHaveBeenCalledWith(testData);
    });

    it('should handle nursai-sync-init message type', () => {
      const onDataUpdate = vi.fn();
      registerNurseAISyncListener(onDataUpdate);

      const listenerCall = mockAddEventListener.mock.calls[0];
      const listener = listenerCall[1] as EventListener;

      const testData = { activeAlerts: ['Alert A'] };
      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-init',
          data: testData,
        },
      });

      listener(event as any);

      expect(onDataUpdate).toHaveBeenCalledWith(testData);
    });

    it('should ignore non-nursai messages', () => {
      const onDataUpdate = vi.fn();
      registerNurseAISyncListener(onDataUpdate);

      const listenerCall = mockAddEventListener.mock.calls[0];
      const listener = listenerCall[1] as EventListener;

      const event = new MessageEvent('message', {
        data: {
          type: 'some-other-message',
          data: { something: 'else' },
        },
      });

      listener(event as any);

      expect(onDataUpdate).not.toHaveBeenCalled();
    });

    it('should return cleanup function', () => {
      const onDataUpdate = vi.fn();
      const cleanup = registerNurseAISyncListener(onDataUpdate);

      expect(typeof cleanup).toBe('function');

      cleanup();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should not call callback if onDataUpdate is undefined', () => {
      const cleanup = registerNurseAISyncListener();

      const listenerCall = mockAddEventListener.mock.calls[0];
      const listener = listenerCall[1] as EventListener;

      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: { test: 'data' },
        },
      });

      // Should not throw
      expect(() => listener(event as any)).not.toThrow();
    });
  });

  describe('Cross-Agent Communication Flow', () => {
    it('should simulate complete sync flow between agents', () => {
      const agent1Callback = vi.fn();
      const agent2Callback = vi.fn();

      // Register listeners for two agents
      registerNurseAISyncListener(agent1Callback);
      registerNurseAISyncListener(agent2Callback);

      // Get both listeners
      const listener1 = mockAddEventListener.mock.calls[0][1] as EventListener;
      const listener2 = mockAddEventListener.mock.calls[1][1] as EventListener;

      // Agent 1 sends data
      const sharedData = {
        patientData: { id: 'P123', name: 'Patient Name' },
        activeAlerts: ['Critical Alert'],
      };

      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: sharedData,
        },
      });

      // Both agents receive the same data
      listener1(event as any);
      listener2(event as any);

      expect(agent1Callback).toHaveBeenCalledWith(sharedData);
      expect(agent2Callback).toHaveBeenCalledWith(sharedData);
    });

    it('should handle sequential updates from multiple agents', () => {
      const callback = vi.fn();
      registerNurseAISyncListener(callback);

      const listener = mockAddEventListener.mock.calls[0][1] as EventListener;

      // First update
      const update1 = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: { patientData: { id: 'P1' } },
        },
      });

      listener(update1 as any);
      expect(callback).toHaveBeenCalledTimes(1);

      // Second update
      const update2 = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: { activeAlerts: ['New Alert'] },
        },
      });

      listener(update2 as any);
      expect(callback).toHaveBeenCalledTimes(2);

      // Verify both updates were received
      expect(callback).toHaveBeenNthCalledWith(1, { patientData: { id: 'P1' } });
      expect(callback).toHaveBeenNthCalledWith(2, { activeAlerts: ['New Alert'] });
    });
  });

  describe('Data Persistence', () => {
    it('should persist sync state to localStorage', () => {
      const testData = {
        patientData: { id: 'P999' },
        recommendations: ['Rec 1', 'Rec 2'],
      };

      // Simulate storing data
      localStorage.setItem(
        'nursai-sync-state',
        JSON.stringify(testData)
      );

      // Retrieve and verify
      const stored = localStorage.getItem('nursai-sync-state');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(testData);
    });

    it('should restore sync state from localStorage on initialization', () => {
      const persistedData = {
        patientData: { id: 'P888' },
        lastUpdate: Date.now(),
      };

      localStorage.setItem('nursai-sync-state', JSON.stringify(persistedData));

      const stored = localStorage.getItem('nursai-sync-state');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(persistedData);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed message data gracefully', () => {
      const onDataUpdate = vi.fn();
      registerNurseAISyncListener(onDataUpdate);

      const listener = mockAddEventListener.mock.calls[0][1] as EventListener;

      // Message without data property
      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          // missing 'data' property
        },
      });

      expect(() => listener(event as any)).not.toThrow();
    });

    it('should handle null/undefined data', () => {
      const onDataUpdate = vi.fn();
      registerNurseAISyncListener(onDataUpdate);

      const listener = mockAddEventListener.mock.calls[0][1] as EventListener;

      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: null,
        },
      });

      listener(event as any);
      expect(onDataUpdate).toHaveBeenCalledWith(null);
    });

    it('should handle circular reference in data', () => {
      const circularData: any = { id: 'test' };
      circularData.self = circularData; // Create circular reference

      // Should not throw when trying to send
      expect(() => {
        sendNurseAIDataUpdate({ id: 'test' }); // Send non-circular version
      }).not.toThrow();
    });
  });

  describe('Agent Synchronization Scenarios', () => {
    it('should sync patient data across all agents', () => {
      const agents = {
        nursai: vi.fn(),
        genomica: vi.fn(),
        oncoai: vi.fn(),
        quorumdeep: vi.fn(),
      };

      // Register all agents
      Object.values(agents).forEach(callback => {
        registerNurseAISyncListener(callback);
      });

      // Get all listeners
      const listeners = mockAddEventListener.mock.calls.map(call => call[1] as EventListener);

      // Broadcast patient data
      const patientData = {
        patientData: {
          id: 'P12345',
          name: 'John Smith',
          age: 65,
          diagnosis: 'Suspected Pancreatic Cancer',
        },
      };

      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: patientData,
        },
      });

      listeners.forEach(listener => listener(event as any));

      // All agents should receive the same data
      Object.values(agents).forEach(callback => {
        expect(callback).toHaveBeenCalledWith(patientData);
      });
    });

    it('should sync clinical recommendations across agents', () => {
      const callback = vi.fn();
      registerNurseAISyncListener(callback);

      const listener = mockAddEventListener.mock.calls[0][1] as EventListener;

      const recommendations = {
        recommendations: [
          {
            agent: 'OncoAI',
            type: 'Diagnostic',
            recommendation: 'Perform endoscopic ultrasound',
            confidence: 0.92,
          },
          {
            agent: 'Genomica',
            type: 'Genetic',
            recommendation: 'BRCA1/2 testing recommended',
            confidence: 0.88,
          },
        ],
      };

      const event = new MessageEvent('message', {
        data: {
          type: 'nursai-sync-update',
          data: recommendations,
        },
      });

      listener(event as any);

      expect(callback).toHaveBeenCalledWith(recommendations);
    });

    it('should sync active alerts in real-time', () => {
      const callback = vi.fn();
      registerNurseAISyncListener(callback);

      const listener = mockAddEventListener.mock.calls[0][1] as EventListener;

      // Initial alerts
      const alerts1 = {
        activeAlerts: [
          { id: 'A1', severity: 'high', message: 'Abnormal lab results' },
          { id: 'A2', severity: 'medium', message: 'Follow-up needed' },
        ],
      };

      const event1 = new MessageEvent('message', {
        data: { type: 'nursai-sync-update', data: alerts1 },
      });

      listener(event1 as any);
      expect(callback).toHaveBeenNthCalledWith(1, alerts1);

      // Updated alerts
      const alerts2 = {
        activeAlerts: [
          { id: 'A1', severity: 'critical', message: 'Critical lab results' },
          { id: 'A3', severity: 'high', message: 'New alert detected' },
        ],
      };

      const event2 = new MessageEvent('message', {
        data: { type: 'nursai-sync-update', data: alerts2 },
      });

      listener(event2 as any);
      expect(callback).toHaveBeenNthCalledWith(2, alerts2);
    });
  });
});
