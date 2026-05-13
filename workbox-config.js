// workbox-config.js
// Generates a service worker with precache manifest for all static assets.
// Used by GitHub Actions during Railway deployment.

export default {
  // Root of the built static assets
  globDirectory: "dist/public",

  // Patterns to precache — all HTML, JS, CSS, images, fonts, and JSON
  globPatterns: [
    "**/*.{html,js,css,png,svg,jpg,jpeg,webp,ico,woff,woff2,ttf,json}",
  ],

  // Output service worker file location
  swDest: "dist/public/sw.js",

  // Runtime caching rules
  runtimeCaching: [
    {
      // Cache-first for all HTML pages (module pages served from Railway)
      urlPattern: /\.html$/,
      handler: "CacheFirst",
      options: {
        cacheName: "html-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      // Stale-while-revalidate for JS/CSS bundles
      urlPattern: /\.(js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Cache-first for images
      urlPattern: /\.(png|svg|jpg|jpeg|webp|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      // Network-first for API calls (tRPC)
      urlPattern: /\/api\/trpc\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    {
      // Network-first for SSE endpoint
      urlPattern: /\/api\/sse/,
      handler: "NetworkOnly",
    },
  ],

  // Skip waiting and claim clients immediately
  skipWaiting: true,
  clientsClaim: true,

  // Inline the Workbox runtime for offline capability
  inlineWorkboxRuntime: false,
};
