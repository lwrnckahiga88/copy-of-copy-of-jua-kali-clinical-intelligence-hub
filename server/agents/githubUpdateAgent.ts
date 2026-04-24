/**
 * GitHub Update Agent (JGA)
 * Governed autonomous repo evolution with safety controls
 * SAFETY: whitelist-only paths, never touches server/auth/payments
 */

import { Octokit } from "@octokit/rest";
import { ENV } from "../_core/env";
import { SwarmBus } from "../swarm/swarmBus";

// ─── SAFETY WHITELIST ─────────────────────────────────────────────────────────
const ALLOWED_PATH_PREFIXES = [
  "registry/",
  "agent-core/",
  "swarm/",
  "execution/",
  "router/",
];

const BLOCKED_PATHS = [
  "server/_core/",
  "server/auth",
  "server/db",
  "server/storage",
  ".env",
  "pnpm-lock.yaml",
  "package.json",
];

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface RepoPatch {
  path: string;
  content: string;
}

export interface PatchResult {
  success: boolean;
  commitSha?: string;
  patchedFiles: string[];
  blockedFiles: string[];
  error?: string;
}

// ─── SAFETY VALIDATION ───────────────────────────────────────────────────────

function validatePath(path: string): { safe: boolean; reason?: string } {
  const normalized = path.replace(/^\//, "");

  for (const blocked of BLOCKED_PATHS) {
    if (normalized.startsWith(blocked) || normalized === blocked) {
      return { safe: false, reason: `Blocked path: ${blocked}` };
    }
  }

  const allowed = ALLOWED_PATH_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix)
  );

  if (!allowed) {
    return {
      safe: false,
      reason: `Not in whitelist. Allowed prefixes: ${ALLOWED_PATH_PREFIXES.join(", ")}`,
    };
  }

  return { safe: true };
}

// ─── CORE AGENT ──────────────────────────────────────────────────────────────

export async function applyRepoPatch(opts: {
  owner: string;
  repo: string;
  branch?: string;
  changes: RepoPatch[];
  commitMessage?: string;
}): Promise<PatchResult> {
  const { owner, repo, branch = "main", changes, commitMessage } = opts;

  const token = ENV.githubToken;
  if (!token) {
    return { success: false, error: "GITHUB_TOKEN not configured", patchedFiles: [], blockedFiles: [] };
  }

  const octokit = new Octokit({ auth: token });

  // ── 1. Validate all paths ──────────────────────────────────────────────────
  const safe: RepoPatch[] = [];
  const blocked: string[] = [];

  for (const file of changes) {
    const check = validatePath(file.path);
    if (check.safe) {
      safe.push(file);
    } else {
      blocked.push(`${file.path} (${check.reason})`);
      console.warn(`[JGA] BLOCKED: ${file.path} — ${check.reason}`);
    }
  }

  if (safe.length === 0) {
    return {
      success: false,
      error: "All proposed changes were blocked by safety rules",
      patchedFiles: [],
      blockedFiles: blocked,
    };
  }

  // ── 2. Get current HEAD ────────────────────────────────────────────────────
  const { data: ref } = await octokit.git.getRef({
    owner, repo, ref: `heads/${branch}`,
  });
  const baseSha = ref.object.sha;

  // ── 3. Create blobs ────────────────────────────────────────────────────────
  const blobs = await Promise.all(
    safe.map(async (file) => {
      const blob = await octokit.git.createBlob({
        owner, repo,
        content: Buffer.from(file.content).toString("base64"),
        encoding: "base64",
      });
      return {
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: blob.data.sha,
      };
    })
  );

  // ── 4. Create tree ─────────────────────────────────────────────────────────
  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    base_tree: baseSha,
    tree: blobs,
  });

  // ── 5. Create commit ───────────────────────────────────────────────────────
  const message = commitMessage ??
    `[Jarvis JGA] Auto-update ${safe.map((f) => f.path).join(", ")}`;

  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message,
    tree: tree.sha,
    parents: [baseSha],
  });

  // ── 6. Advance branch ref ─────────────────────────────────────────────────
  await octokit.git.updateRef({
    owner, repo,
    ref: `heads/${branch}`,
    sha: commit.sha,
    force: false,
  });

  // ── 7. Emit to swarm bus ───────────────────────────────────────────────────
  SwarmBus.emit("agent:completed", {
    agentId: "github-update-agent",
    data: {
      commitSha: commit.sha,
      files: safe.map((f) => f.path),
      blocked,
    },
  });

  return {
    success: true,
    commitSha: commit.sha,
    patchedFiles: safe.map((f) => f.path),
    blockedFiles: blocked,
  };
}
