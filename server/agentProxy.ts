/**
 * Agent HTML Proxy
 * Fetches HTML files from health-ai GitHub repo and serves them
 * with X-Frame-Options removed so iframes can render them.
 *
 * Route: GET /proxy/agent?file=NurseAI.html
 */

import type { Express, Request, Response } from "express";

const RAW_BASE =
  "https://raw.githubusercontent.com/lwrnckahiga88/health-ai/main/public";

// Simple allowlist — only files from the health-ai public dir
function isSafeFilename(file: string): boolean {
  return (
    typeof file === "string" &&
    file.length > 0 &&
    file.length < 200 &&
    !file.includes("..") &&
    !file.includes("/") &&
    !file.includes("\\") &&
    /\.(html|htm|js|css|json|png|svg|ico|woff|woff2|ttf)$/i.test(file)
  );
}

export function registerAgentProxy(app: Express): void {
  app.get("/proxy/agent", async (req: Request, res: Response) => {
    const file = req.query.file as string | undefined;

    if (!file || !isSafeFilename(file)) {
      res.status(400).send("Invalid or missing file parameter");
      return;
    }

    const url = `${RAW_BASE}/${encodeURIComponent(file)}`;

    try {
      const upstream = await fetch(url, {
        headers: {
          "User-Agent": "juakali-proxy/1.0",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!upstream.ok) {
        res
          .status(upstream.status)
          .send(`Upstream error: ${upstream.status} ${upstream.statusText}`);
        return;
      }

      const body = await upstream.text();
      const contentType = upstream.headers.get("content-type") ?? "text/html";

      // Strip framing restrictions, set permissive CORS
      res.setHeader("Content-Type", contentType);
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Security-Policy", "");
      res.removeHeader("X-Frame-Options");

      // Inject a <base> tag so relative assets resolve against GitHub raw
      const baseDir = file.substring(0, file.lastIndexOf("/") + 1);
      const baseTag = `<base href="${RAW_BASE}/${baseDir}">`;
      const patched = body.replace(
        /(<head[^>]*>)/i,
        `$1\n  ${baseTag}`
      );

      res.status(200).send(patched);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(502).send(`Proxy fetch failed: ${msg}`);
    }
  });

  // Proxy for asset files referenced by agents (CSS, JS, images)
  app.get("/proxy/asset", async (req: Request, res: Response) => {
    const file = req.query.file as string | undefined;
    if (!file || !isSafeFilename(file)) {
      res.status(400).send("Invalid file");
      return;
    }

    const url = `${RAW_BASE}/${encodeURIComponent(file)}`;
    try {
      const upstream = await fetch(url, {
        signal: AbortSignal.timeout(10_000),
      });
      const contentType =
        upstream.headers.get("content-type") ?? "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(upstream.status);
      const buf = await upstream.arrayBuffer();
      res.send(Buffer.from(buf));
    } catch (err) {
      res.status(502).send("Asset fetch failed");
    }
  });
}
