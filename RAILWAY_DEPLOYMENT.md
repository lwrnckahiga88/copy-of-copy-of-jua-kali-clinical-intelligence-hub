# Railway Deployment Guide - Juakali Hub

This guide provides step-by-step instructions for deploying Juakali Hub to Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Environment variables configured

## Deployment Steps

### 1. Prepare Environment Variables

Railway will automatically inject the following environment variables. Ensure they are configured in your Railway project settings:

**Database & Core:**
- `DATABASE_URL`: MySQL/TiDB connection string
- `JWT_SECRET`: Session cookie signing secret

**OAuth & Authentication:**
- `VITE_APP_ID`: Manus OAuth application ID
- `OAUTH_SERVER_URL`: Manus OAuth backend base URL
- `VITE_OAUTH_PORTAL_URL`: Manus login portal URL
- `OWNER_OPEN_ID`: Owner's OpenID
- `OWNER_NAME`: Owner's name

**Manus Built-in APIs:**
- `BUILT_IN_FORGE_API_URL`: Manus built-in APIs base URL
- `BUILT_IN_FORGE_API_KEY`: Bearer token for server-side API access
- `VITE_FRONTEND_FORGE_API_KEY`: Bearer token for frontend API access
- `VITE_FRONTEND_FORGE_API_URL`: Manus built-in APIs URL for frontend

**M-Pesa Payment Integration:**
- `MPESA_CONSUMER_KEY`: M-Pesa Daraja API consumer key
- `MPESA_CONSUMER_SECRET`: M-Pesa Daraja API consumer secret
- `MPESA_SHORT_CODE`: M-Pesa business short code
- `MPESA_PASSKEY`: M-Pesa passkey for STK Push
- `MPESA_CALLBACK_URL`: Webhook URL for payment callbacks (e.g., https://your-app.railway.app/api/mpesa/callback)
- `MPESA_BASE_URL`: M-Pesa API base URL (https://api.safaricom.co.ke for production)

**Frontend Configuration:**
- `VITE_APP_TITLE`: Application title (default: "Juakali Hub")
- `VITE_APP_LOGO`: Application logo URL

### 2. Connect GitHub Repository

1. Go to Railway dashboard
2. Create a new project
3. Select "Deploy from GitHub"
4. Authorize Railway to access your GitHub account
5. Select the repository containing Juakali Hub
6. Select the branch to deploy (typically `main`)

### 3. Configure Build Settings

Railway will automatically detect the Dockerfile and use it for building. The configuration in `railway.json` specifies:

```json
{
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyMaxRetries": 5,
    "restartPolicyWindowSeconds": 600
  }
}
```

### 4. Deploy Application

1. Set all required environment variables in Railway project settings
2. Push code to your GitHub repository
3. Railway will automatically trigger a build and deployment
4. Monitor the deployment logs in the Railway dashboard

### 5. Verify Deployment

Once deployed, verify the application is running:

```bash
# Check health endpoint
curl https://your-app.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2026-05-18T..."}
```

### 6. Configure Custom Domain (Optional)

1. In Railway dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Railway

## Database Setup

The application uses Drizzle ORM with MySQL. The database schema includes:

- `users`: User accounts and authentication
- `credits`: User credit balances
- `paymentTransactions`: M-Pesa payment history
- `agentUsageLog`: Agent usage tracking
- `genomicsMutations`: Genomic analysis data
- `proteinStructures`: Protein folding results
- `cancerProfiles`: Cancer analysis profiles
- `geneticScreeningResults`: Genetic screening data
- `crossAgentSyncData`: Cross-agent data sharing
- `analyticsAggregates`: Analytics data aggregation
- `hospitals`: Hospital information for intervention planning
- `ambulances`: Ambulance fleet data
- `dispatchRecords`: Emergency dispatch records
- `imagingRecords`: Medical imaging records

Migrations are automatically applied on deployment.

## WebSocket Configuration

The application includes a WebSocket server at `/api/ws` for real-time agent synchronization. Railway supports WebSocket connections natively.

**WebSocket Features:**
- Real-time agent data synchronization
- Genomics result streaming
- Imaging analysis updates
- Dispatch status tracking
- Consensus scoring notifications

## Monitoring & Logging

Railway provides built-in monitoring:

1. **Logs**: View application logs in the Railway dashboard
2. **Metrics**: Monitor CPU, memory, and network usage
3. **Alerts**: Set up alerts for deployment failures

## Troubleshooting

### Build Failures

If the build fails, check:
1. Node.js version compatibility (requires Node 22+)
2. All dependencies are in `package.json`
3. Environment variables are set correctly

### Runtime Errors

If the application crashes after deployment:
1. Check logs in Railway dashboard
2. Verify database connection string
3. Ensure all required environment variables are set
4. Check M-Pesa credentials for payment integration

### WebSocket Connection Issues

If WebSocket connections fail:
1. Verify the WebSocket server is initialized in `server/_core/index.ts`
2. Check that the `/api/ws` path is not blocked
3. Ensure clients connect with proper userId and agentId parameters

## Performance Optimization

For production deployment:

1. **Enable caching**: Set appropriate cache headers for static assets
2. **Database optimization**: Use connection pooling and query optimization
3. **WebSocket scaling**: Consider using Redis for multi-instance deployments
4. **CDN integration**: Use Railway's CDN for static assets

## Security Considerations

1. **HTTPS**: Railway automatically provides HTTPS for all deployments
2. **Environment variables**: Never commit sensitive data to GitHub
3. **Database**: Use strong passwords and enable SSL for database connections
4. **API keys**: Rotate M-Pesa and OAuth credentials regularly
5. **CORS**: Configure CORS headers for cross-origin requests

## Rollback Procedures

If deployment causes issues:

1. Go to Railway dashboard
2. Navigate to "Deployments"
3. Select a previous deployment
4. Click "Redeploy" to rollback

## Support

For deployment issues:
- Check Railway documentation: https://docs.railway.app
- Review application logs in Railway dashboard
- Contact Railway support: https://railway.app/support

## Next Steps

After successful deployment:

1. Test all features in production environment
2. Configure monitoring and alerts
3. Set up backup procedures for database
4. Plan for scaling if needed
5. Document any custom configurations
