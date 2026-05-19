module.exports = {
  globDirectory: 'client/dist/',
  globPatterns: [
    '**/*.{html,js,css,png,svg,json,woff,woff2,ttf,eot}',
  ],
  globIgnores: [
    '**/node_modules/**/*',
    '**/*.map',
  ],
  swDest: 'client/dist/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  runtimeCaching: [
    // API calls - Network First with timeout
    {
      urlPattern: /^https:\/\/.*\/api\/trpc\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    // HTML agent modules - Cache First
    {
      urlPattern: /^\/agents\/.*\.html$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'agent-modules',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Images - Cache First
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Fonts - Cache First (long expiration)
    {
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // CDN libraries - Stale While Revalidate
    {
      urlPattern: /^https:\/\/(cdn|unpkg|cdnjs)\..*\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'cdn-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/^\/api\//],
};
