# Jua Kali Hub - Project TODO

## Phase 1: Project Setup & Design System
- [ ] Create design system tokens in index.css (dark theme, colors, typography, spacing)
- [ ] Set up global styling and Tailwind configuration
- [ ] Create reusable component library structure

## Phase 2: Landing Page & Authentication
- [ ] Build landing page with hero section
- [ ] Create pricing page with three tiers (Free, Pro, Enterprise)
- [ ] Implement Manus OAuth login flow
- [ ] Create login redirect for unauthenticated users
- [ ] Add logout functionality

## Phase 3: Dashboard Layout & Navigation
- [ ] Create DashboardLayout component with sidebar
- [ ] Build sidebar navigation with 55+ agent listing
- [ ] Implement agent search functionality
- [ ] Implement category filtering in sidebar
- [ ] Create category grouping logic
- [ ] Add credit balance display in dashboard header

## Phase 4: Agent System & iframe Loader
- [ ] Create pageMapping.ts with all 55 agent configurations
- [ ] Define agent properties: id, name, description, category, htmlFile, creditCost
- [ ] Build agent iframe loader component
- [ ] Implement agent loading from /agents/<filename> path
- [ ] Create agent detail view in dashboard
- [ ] Add agent information display (name, description, cost)

## Phase 5: Credit System
- [ ] Create credits table in database schema
- [ ] Add credit initialization (100 credits for new users)
- [ ] Build credit deduction logic when opening agents
- [ ] Create credit balance query endpoint
- [ ] Build credit display component
- [ ] Add insufficient credits warning

## Phase 6: Mpesa Integration
- [ ] Create Mpesa configuration with Daraja API credentials
- [ ] Build STK Push initiation endpoint
- [ ] Create phone number input form
- [ ] Implement payment callback handling
- [ ] Add credit top-up logic after successful payment
- [ ] Build "Top Up with Mpesa" button component
- [ ] Add payment status notifications

## Phase 7: Service Worker & PWA
- [ ] Create workbox-config.js for precaching
- [ ] Register service worker in client
- [ ] Precache all 55+ HTML agent modules
- [ ] Implement offline-first caching strategy
- [ ] Add service worker update notifications
- [ ] Create manifest.json for PWA

## Phase 8: GitHub Actions & Deployment
- [ ] Create .github/workflows/deploy.yml
- [ ] Configure Workbox service worker generation step
- [ ] Set up Railway deployment action
- [ ] Add RAILWAY_TOKEN secret configuration
- [ ] Test deployment pipeline

## Phase 9: Testing & Refinement
- [ ] Test authentication flow
- [ ] Test agent loading and iframe functionality
- [ ] Test credit system (deduction, display)
- [ ] Test Mpesa payment flow
- [ ] Test offline mode with service worker
- [ ] Test responsive design across devices
- [ ] Performance optimization
- [ ] Cross-browser testing

## Phase 10: Final Delivery
- [ ] Create deployment checkpoint
- [ ] Document setup instructions
- [ ] Verify all features working
- [ ] Deploy to Railway
