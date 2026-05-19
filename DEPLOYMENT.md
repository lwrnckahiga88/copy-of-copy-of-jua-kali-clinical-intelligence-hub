# Jua Kali Hub - Deployment Guide

## Overview

Jua Kali Hub is a premium AI agent dashboard platform designed for Railway deployment with GitHub Actions CI/CD integration. This guide covers setup, deployment, and maintenance.

## Prerequisites

- GitHub account with repository access
- Railway account (https://railway.app)
- Node.js 22+ (for local development)
- pnpm package manager

## Quick Start

### 1. Railway Setup

1. **Create Railway Account**
   - Visit https://railway.app
   - Sign up with GitHub
   - Create a new project

2. **Generate Railway Token**
   - Go to Account Settings → Tokens
   - Create a new token
   - Copy the token (you'll need this for GitHub)

3. **Get Service ID** (Optional but recommended)
   - In Railway Dashboard, navigate to your service
   - Copy the Service ID from settings

### 2. GitHub Setup

1. **Add Secrets to GitHub**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `RAILWAY_TOKEN`: Your Railway token from step 1
     - `RAILWAY_SERVICE_ID`: (Optional) Your service ID

2. **Enable Workflow Permissions**
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Save

### 3. Deploy

#### Option A: Automatic Deployment (Recommended)

1. Push to main branch:
   ```bash
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Build the application
   - Generate the service worker
   - Deploy to Railway
   - Run health checks

#### Option B: Manual Deployment

1. **Using Railway CLI**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Deploy
   railway up
   ```

2. **Using Docker**
   ```bash
   # Build Docker image
   docker build -t juakali-hub .

   # Run locally
   docker run -p 3000:3000 juakali-hub
   ```

## Configuration

### Environment Variables

The following environment variables are automatically injected by the Manus platform:

- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Session signing secret
- `VITE_APP_ID`: OAuth application ID
- `OAUTH_SERVER_URL`: OAuth server URL
- `VITE_OAUTH_PORTAL_URL`: OAuth portal URL
- `OWNER_OPEN_ID`: Owner's OpenID
- `OWNER_NAME`: Owner's name
- `BUILT_IN_FORGE_API_URL`: Manus API URL
- `BUILT_IN_FORGE_API_KEY`: Manus API key
- `VITE_FRONTEND_FORGE_API_URL`: Frontend API URL
- `VITE_FRONTEND_FORGE_API_KEY`: Frontend API key

### Database Setup

The application uses MySQL with Drizzle ORM. On first deployment:

1. Database tables are automatically created
2. Initial user credits (100) are assigned on signup
3. Agent usage is logged for analytics

### Service Worker

The service worker is automatically generated during build:

1. **Precaching**: All HTML, CSS, JS, and image files
2. **Runtime Caching**:
   - API calls: Network First (5s timeout)
   - Agent modules: Cache First
   - Images: Cache First (30 days)
   - Fonts: Cache First (1 year)
   - CDN: Stale While Revalidate

3. **Offline Support**: App works offline with cached content

## Monitoring & Maintenance

### Health Checks

Railway automatically monitors your application:

- Endpoint: `http://localhost:3000`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

### Logs

View deployment logs in Railway Dashboard:

1. Go to your service
2. Click "Deployments"
3. Select the deployment
4. View logs in real-time

### Performance Optimization

1. **Build Size**
   - Vite automatically optimizes bundle
   - Service worker precaches only necessary files
   - ~2-3MB total deployment size

2. **Cold Starts**
   - Railway keeps instances warm
   - First request typically <1s
   - Subsequent requests <100ms

3. **Database**
   - Connection pooling via Drizzle
   - Indexes on frequently queried columns
   - Regular backups via Railway

## Troubleshooting

### Deployment Fails

1. **Check GitHub Actions logs**
   - Go to Actions tab
   - Click the failed workflow
   - Review error messages

2. **Common issues**:
   - Missing `RAILWAY_TOKEN` secret
   - Insufficient permissions
   - Build failures (check Node version)

### Service Worker Issues

1. **Clear cache**
   - DevTools → Application → Clear storage
   - Or use incognito mode

2. **Check registration**
   - DevTools → Application → Service Workers
   - Verify registration status

3. **Offline mode test**
   - DevTools → Network → Offline
   - Reload page
   - Should load from cache

### Database Connection Issues

1. **Verify connection string**
   - Check `DATABASE_URL` in Railway
   - Ensure database is running
   - Check firewall rules

2. **Reset database**
   - Go to Railway Dashboard
   - Delete and recreate database
   - Redeploy application

## Scaling

### Horizontal Scaling

1. In Railway Dashboard:
   - Go to your service settings
   - Increase "Replica Count"
   - Railway automatically load balances

### Vertical Scaling

1. In Railway Dashboard:
   - Go to your service settings
   - Increase "CPU" and "Memory"
   - Service restarts with new resources

## Security

### Best Practices

1. **Secrets Management**
   - Never commit `.env` files
   - Use GitHub Secrets for sensitive data
   - Rotate tokens regularly

2. **HTTPS**
   - Railway provides automatic SSL certificates
   - All traffic encrypted in transit
   - HSTS headers enabled

3. **Database**
   - Connection uses SSL/TLS
   - Credentials stored securely
   - Regular backups

4. **Authentication**
   - Manus OAuth integration
   - JWT session tokens
   - HttpOnly, Secure cookies

## Rollback

If deployment causes issues:

1. **Via Railway Dashboard**
   - Go to Deployments
   - Select previous deployment
   - Click "Rollback"

2. **Via GitHub**
   - Revert commit
   - Push to main
   - New deployment triggers automatically

## Support

For issues or questions:

1. Check Railway documentation: https://docs.railway.app
2. Review application logs in Railway Dashboard
3. Check GitHub Actions workflow logs
4. Contact Railway support: https://railway.app/support

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [tRPC Documentation](https://trpc.io)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
