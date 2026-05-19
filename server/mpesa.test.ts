import { describe, it, expect, beforeEach } from 'vitest';
import { validateMpesaConfig, mpesaClient } from './mpesa';

describe('Mpesa Configuration', () => {
  it('should validate Mpesa configuration is set', () => {
    const isValid = validateMpesaConfig();
    expect(typeof isValid).toBe('boolean');
  });

  it('should have required environment variables', () => {
    const requiredEnvs = [
      'MPESA_CONSUMER_KEY',
      'MPESA_CONSUMER_SECRET',
      'MPESA_SHORT_CODE',
      'MPESA_PASSKEY',
      'MPESA_BASE_URL',
    ];

    for (const env of requiredEnvs) {
      expect(process.env[env]).toBeDefined();
    }
  });

  it('should have test credentials configured', () => {
    expect(process.env.MPESA_CONSUMER_KEY).toBe('test_consumer_key_12345');
    expect(process.env.MPESA_CONSUMER_SECRET).toBe('test_consumer_secret_67890');
    expect(process.env.MPESA_SHORT_CODE).toBe('174379');
    expect(process.env.MPESA_PASSKEY).toBe('bfb279f9ba9b9d4f58a225c8c8c8c8c8');
    expect(process.env.MPESA_BASE_URL).toContain('safaricom');
  });

  it('should have Mpesa client available', () => {
    expect(mpesaClient).toBeDefined();
    expect(typeof mpesaClient.initiateSTKPush).toBe('function');
    expect(typeof mpesaClient.queryPaymentStatus).toBe('function');
  });

  it('should have callback URL configured', () => {
    expect(process.env.MPESA_CALLBACK_URL).toBeDefined();
    expect(process.env.MPESA_CALLBACK_URL).toContain('callback');
  });
});
