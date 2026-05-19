import axios from 'axios';
import { ENV } from './_core/env';

/**
 * Mpesa Daraja API Integration
 * Handles STK Push initiation and payment callbacks
 */

interface DarajaConfig {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
}

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
}

interface CallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

class MpesaDarajaClient {
  private config: DarajaConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke',
      shortCode: process.env.MPESA_SHORT_CODE || '',
      passkey: process.env.MPESA_PASSKEY || '',
      callbackUrl: process.env.MPESA_CALLBACK_URL || '',
    };
  }

  /**
   * Get OAuth access token from Daraja API
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry > now) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      this.accessToken = response.data.access_token as string;
      this.tokenExpiry = now + (((response.data.expires_in as number) || 3600) * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('[Mpesa] Failed to get access token:', error);
      throw new Error('Failed to authenticate with Mpesa Daraja API');
    }
  }

  /**
   * Initiate STK Push for payment
   */
  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken();

      // Format phone number: remove leading 0 and add country code
      const formattedPhone = request.phoneNumber.startsWith('0')
        ? `254${request.phoneNumber.slice(1)}`
        : request.phoneNumber.startsWith('254')
        ? request.phoneNumber
        : `254${request.phoneNumber}`;

      // Generate timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:-]/g, '')
        .slice(0, -5);

      // Generate password: Base64(ShortCode + Passkey + Timestamp)
      const password = Buffer.from(
        `${this.config.shortCode}${this.config.passkey}${timestamp}`
      ).toString('base64');

      const payload = {
        BusinessShortCode: this.config.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(request.amount),
        PartyA: formattedPhone,
        PartyB: this.config.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc,
      };

      const response = await axios.post(
        `${this.config.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[Mpesa] STK Push initiated:', {
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
      });

      return {
        ResponseCode: response.data.ResponseCode,
        ResponseDescription: response.data.ResponseDescription,
        MerchantRequestID: response.data.MerchantRequestID,
        CheckoutRequestID: response.data.CheckoutRequestID,
      };
    } catch (error) {
      console.error('[Mpesa] STK Push failed:', error);
      throw error;
    }
  }

  /**
   * Query payment status using CheckoutRequestID
   */
  async queryPaymentStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const timestamp = new Date()
        .toISOString()
        .replace(/[:-]/g, '')
        .slice(0, -5);

      const password = Buffer.from(
        `${this.config.shortCode}${this.config.passkey}${timestamp}`
      ).toString('base64');

      const payload = {
        BusinessShortCode: this.config.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.config.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[Mpesa] Query payment status failed:', error);
      throw error;
    }
  }

  /**
   * Process callback from Daraja API
   */
  processCallback(payload: CallbackPayload): {
    success: boolean;
    resultCode: number;
    resultDesc: string;
    transactionData?: {
      mpesaReceiptNumber: string;
      amount: number;
      phoneNumber: string;
      transactionDate: string;
    };
  } {
    const callback = payload.Body.stkCallback;

    // Result code 0 means successful payment
    if (callback.ResultCode === 0 && callback.CallbackMetadata) {
      const items = callback.CallbackMetadata.Item;
      const transactionData: Record<string, any> = {};

      items.forEach((item: any) => {
        transactionData[item.Name] = item.Value;
      });

      return {
        success: true,
        resultCode: callback.ResultCode,
        resultDesc: callback.ResultDesc,
        transactionData: {
          mpesaReceiptNumber: transactionData.MpesaReceiptNumber,
          amount: transactionData.Amount,
          phoneNumber: transactionData.PhoneNumber,
          transactionDate: transactionData.TransactionDate,
        },
      };
    }

    return {
      success: false,
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
    };
  }
}

// Export singleton instance
export const mpesaClient = new MpesaDarajaClient();

/**
 * Helper function to validate Mpesa configuration
 */
export function validateMpesaConfig(): boolean {
  const requiredEnvs = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_SHORT_CODE',
    'MPESA_PASSKEY',
    'MPESA_CALLBACK_URL',
  ];

  const missing = requiredEnvs.filter(env => !process.env[env]);

  if (missing.length > 0) {
    console.warn('[Mpesa] Missing configuration:', missing);
    return false;
  }

  return true;
}
