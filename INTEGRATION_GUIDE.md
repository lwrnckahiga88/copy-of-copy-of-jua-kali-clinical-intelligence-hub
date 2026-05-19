# Juakali Hub Integration Guide

## Mpesa Daraja Integration

### Overview
The Juakali Hub platform integrates with Safaricom's Mpesa Daraja API to enable STK Push payments for purchasing credits. Users can pay via M-Pesa and receive credits instantly.

### Configuration

**Environment Variables Required:**
```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORT_CODE=your_short_code
MPESA_PASSKEY=your_passkey
MPESA_BASE_URL=https://sandbox.safaricom.co.ke  # or production URL
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

### API Endpoints

#### Initiate STK Push
**Route:** `POST /api/trpc/payment.initiateSTKPush`

**Request:**
```json
{
  "phoneNumber": "254712345678",
  "amount": 1000,
  "credits": 100
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "txn_abc123",
  "checkoutRequestId": "ws_co_123456",
  "merchantRequestId": "mr_123456",
  "message": "Payment prompt sent to your phone. Enter your M-Pesa PIN to complete."
}
```

#### Confirm Payment
**Route:** `POST /api/trpc/payment.confirmPayment`

**Request:**
```json
{
  "transactionId": "txn_abc123",
  "checkoutRequestId": "ws_co_123456"
}
```

**Response:**
```json
{
  "success": true,
  "status": "completed",
  "message": "100 credits added to your account!",
  "creditsAdded": 100
}
```

### Webhook Callback

**Endpoint:** `POST /api/mpesa/callback`

Receives payment confirmations from Daraja API. Automatically updates transaction status and adds credits to user account.

**Callback Payload:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "mr_123456",
      "CheckoutRequestID": "ws_co_123456",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 1000 },
          { "Name": "MpesaReceiptNumber", "Value": "LHG31Z5A60" },
          { "Name": "TransactionDate", "Value": 20260515120000 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

### Testing

**Sandbox Credentials:**
- Base URL: https://sandbox.safaricom.co.ke
- Consumer Key/Secret: Available from Safaricom Developer Portal
- Test Phone: 254712345678 (use any valid format)
- Test PIN: 1234

**Production Deployment:**
1. Get production credentials from Safaricom
2. Update MPESA_BASE_URL to https://api.safaricom.co.ke
3. Update MPESA_CALLBACK_URL to your production domain
4. Test with real transactions

---

## Genomics Module

### Overview
The genomics module provides AI-powered analysis for DNA sequences, genetic risk assessment, protein structure prediction, and pan-cancer analysis. All results are shared in real-time with other medical AI agents.

### Available Analyses

#### 1. Sequence Analysis
Analyzes DNA/RNA sequences for variants and mutations.

**Endpoint:** `POST /api/trpc/genomics.analyzeSequence`

**Request:**
```json
{
  "sequenceData": "ATCGATCGATCG...",
  "referenceGenome": "GRCh38",
  "analysisType": "wes"
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "gen_abc123",
  "variantCount": 5,
  "summary": "Found 5 variants including 2 high-impact mutations",
  "variants": [
    {
      "chromosome": "1",
      "position": 12345,
      "reference": "A",
      "alternate": "T",
      "variantType": "SNV",
      "consequence": "missense_variant",
      "clinicalSignificance": "pathogenic"
    }
  ]
}
```

#### 2. Genetic Screening
Risk assessment for inherited diseases based on family history.

**Endpoint:** `POST /api/trpc/genomics.screenGenetics`

**Request:**
```json
{
  "familyHistory": "Mother: breast cancer at 45, Father: healthy",
  "ethnicity": "European",
  "screeningType": "cancer"
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "scr_abc123",
  "riskLevel": "high",
  "riskScore": 0.75,
  "inheritedConditions": ["BRCA1 mutation", "Lynch syndrome"],
  "recommendations": "Recommend genetic counseling and BRCA testing"
}
```

#### 3. Protein Folding
3D structure prediction and drug interaction analysis.

**Endpoint:** `POST /api/trpc/genomics.predictProteinStructure`

**Request:**
```json
{
  "proteinSequence": "MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVV...",
  "proteinName": "TP53"
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "prot_abc123",
  "proteinName": "TP53",
  "confidenceScore": 0.92,
  "predictedFunction": "Tumor suppressor, DNA binding",
  "bindingSites": [
    { "site": "DNA binding domain", "function": "Sequence-specific DNA binding" }
  ],
  "drugInteractions": ["Nutlin-3", "PRIMA-1"],
  "therapeuticTargets": ["MDM2", "p21"]
}
```

#### 4. Pan-Cancer Analysis
Cross-cancer mutation analysis and treatment recommendations.

**Endpoint:** `POST /api/trpc/genomics.analyzePanCancer`

**Request:**
```json
{
  "cancerType": "breast",
  "mutations": ["TP53", "BRCA1", "PIK3CA"],
  "stage": "II"
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "cancer_abc123",
  "tumorMutationalBurden": 8.5,
  "riskScore": 0.68,
  "prognosis": "Intermediate risk with good treatment response expected",
  "sharedMutations": ["TP53 (found in 50% of cancers)"],
  "biomarkers": ["HER2+", "ER+"],
  "treatmentRecommendations": ["Tamoxifen", "Trastuzumab", "Chemotherapy"]
}
```

### Cross-Agent Data Sharing

All genomics results are automatically shared with:
- OncoAI (oncology analysis)
- Clinical Validator (clinical decision support)
- Medos (medical decision support)
- NurseAI (nursing care planning)
- Genomica (genomics database)

**Retrieve Shared Data:**
```
POST /api/trpc/genomics.getSharedData
{
  "analysisId": "gen_abc123"
}
```

### LLM Integration

All analyses use the Manus LLM with structured JSON responses for:
- Variant interpretation
- Risk assessment
- Protein function prediction
- Treatment recommendations

---

## Analytics Dashboard

### User Analytics

**Endpoint:** `GET /api/trpc/payment.getCredits`

Returns:
- Current credit balance
- Total credits spent
- Total credits earned

**Endpoint:** `GET /api/trpc/payment.getPaymentHistory`

Returns:
- All payment transactions
- Payment status (pending/completed/failed)
- M-Pesa receipt numbers
- Timestamps

### Admin Analytics

**Endpoint:** `GET /api/trpc/admin.getPlatformStats` (admin only)

Returns:
- Total users
- Total revenue
- Total credits issued
- Platform health metrics

**Endpoint:** `GET /api/trpc/admin.getPaymentAnalytics` (admin only)

Returns:
- Total transactions
- Revenue by status
- Payment trends

**Endpoint:** `GET /api/trpc/admin.getAgentAnalytics` (admin only)

Returns:
- Agent usage statistics
- Most popular agents
- Credit consumption by agent

---

## Deployment Checklist

### Pre-Deployment

- [ ] Update Mpesa credentials to production values
- [ ] Update MPESA_BASE_URL to production endpoint
- [ ] Configure MPESA_CALLBACK_URL to production domain
- [ ] Test all payment flows in production sandbox
- [ ] Verify database migrations are applied
- [ ] Run full test suite: `pnpm test`
- [ ] Check TypeScript compilation: `pnpm check`
- [ ] Review environment variables

### Deployment

- [ ] Create database backup
- [ ] Deploy code to production
- [ ] Verify OAuth callback is working
- [ ] Test Mpesa STK Push with test credentials
- [ ] Monitor payment webhook callbacks
- [ ] Verify analytics dashboard data
- [ ] Test genomics analysis with sample data
- [ ] Confirm cross-agent data sharing

### Post-Deployment

- [ ] Monitor error logs for OAuth issues
- [ ] Track payment success rate
- [ ] Validate analytics accuracy
- [ ] Monitor LLM API usage
- [ ] Set up alerts for failed payments
- [ ] Regular backup of database
- [ ] Update production credentials in secrets manager

---

## Troubleshooting

### Mpesa Integration Issues

**Problem:** "OAuth callback failed"
- Check OAUTH_SERVER_URL is configured
- Verify network connectivity to Manus OAuth server
- Check application logs for detailed error messages

**Problem:** "STK Push failed"
- Verify Mpesa credentials are correct
- Check phone number format (254712345678)
- Ensure amount is positive integer
- Verify callback URL is accessible

**Problem:** "Payment not confirmed"
- Check webhook endpoint is receiving callbacks
- Verify database is recording transactions
- Check Mpesa transaction status in dashboard

### Genomics Analysis Issues

**Problem:** "LLM analysis failed"
- Verify LLM API is accessible
- Check sequence data format
- Ensure request payload matches schema
- Review LLM logs for parsing errors

**Problem:** "Cross-agent data not shared"
- Verify shareAnalysisData function is called
- Check crossAgentSyncData table for records
- Ensure accessible agents are configured
- Review database transaction logs

---

## Support

For issues or questions:
1. Check application logs in `.manus-logs/`
2. Review error messages in response payloads
3. Verify environment configuration
4. Test with curl or Postman
5. Contact Manus support for platform issues
