/**
 * Service Worker Registration Script
 * Handles SW registration, updates, and offline functionality
 */

if ('serviceWorker' in navigator) {
  // Register service worker on page load
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[SW] Service Worker registered successfully:', registration);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready
              console.log('[SW] New service worker available');
              
              // Notify user about update
              if (window.confirm('A new version of Jua Kali Hub is available. Reload to update?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW] Message received:', event.data);
    });
  });

  // Handle controller change (new SW activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW] Controller changed - new service worker is active');
  });

  // Detect offline/online status
  window.addEventListener('online', () => {
    console.log('[SW] Back online');
    document.body.classList.remove('offline');
  });

  window.addEventListener('offline', () => {
    console.log('[SW] Went offline');
    document.body.classList.add('offline');
  });

  // Check initial offline status
  if (!navigator.onLine) {
    document.body.classList.add('offline');
  }
}
