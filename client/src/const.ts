export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // Fallback if OAuth portal URL is not configured
  if (!oauthPortalUrl) {
    console.warn(
      "[Auth] VITE_OAUTH_PORTAL_URL is not configured. Using fallback login page."
    );
    return "/login";
  }

  if (!appId) {
    console.warn(
      "[Auth] VITE_APP_ID is not configured. Cannot generate login URL."
    );
    return "/login";
  }

  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("[Auth] Failed to generate login URL:", error);
    return "/login";
  }
};
