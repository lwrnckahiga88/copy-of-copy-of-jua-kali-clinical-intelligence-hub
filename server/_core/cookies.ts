import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  // Check if the request is already HTTPS
  if (req.protocol === "https") return true;

  // Check x-forwarded-proto header (set by Railway, Vercel, etc.)
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) {
    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : forwardedProto.split(",");
    if (protoList.some(proto => proto.trim().toLowerCase() === "https")) {
      return true;
    }
  }

  // Check x-forwarded-proto-version header (some proxies use this)
  const forwardedProtoVersion = req.headers["x-forwarded-proto-version"];
  if (forwardedProtoVersion === "https") return true;

  // In production, assume HTTPS if not explicitly HTTP
  if (process.env.NODE_ENV === "production") {
    return true;
  }

  return false;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  
  // In production (Railway, etc.), use sameSite: "lax" with secure: true
  // In development, use sameSite: "lax" without secure requirement
  const sameSite = secure ? "lax" : "lax";

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
  };
}
