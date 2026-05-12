// Service Worker Registration
// Registers the Workbox-generated sw.js for offline caching of Railway-hosted modules.
// Each module HTML file is served from https://your-railway-app.up.railway.app/module.html
// and is cached by the service worker for offline access.

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[SW] Registered:", registration.scope);

        // Check for updates on each page load
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[SW] New content available; refresh to update.");
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  });
}
