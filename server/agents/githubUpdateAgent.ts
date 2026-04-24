import { Octokit } from "@octokit/rest";
import type { RestEndpointMethodTypes } from "@octokit/rest";

/**
 * GitHub Update Agent (JGA)
 * Controlled autonomous repository evolution with safety controls
 * 
 * This agent allows Jarvis to propose and apply changes to the repository
 * while enforcing strict safety rules to prevent breaking production.
 */

// Safety configuration
const SAFETY_CONFIG = {
  // Paths that are allowed to be modified
  ALLOWED_PATHS: [
    "/server/agents",
    "/server/routers",
    "/server/studioOS",
    "/shared/agent-types",
    "/client/src/pages",
    "/client/src/components",
    "/drizzle/schema",
  ],

  // Paths that are absolutely forbidden
  FORBIDDEN_PATHS: ["/server/_core", "/server/index.ts", ".env", ".env.local"],

  // Critical files that require special handling
  CRITICAL_FILES: [
    "package.json",
    "tsconfig.json",
    "drizzle.config.ts",
    "server/_core/index.ts",
  ],

  // Maximum file size (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Maximum number of files per commit
  MAX_FILES_PER_COMMIT: 50,

  // Require approval for these operations
  REQUIRE_APPROVAL: ["delete", "critical-file-modify", "dependency-upgrade"],
};

export interface FileChange {
  path: string;
  content: string;
  action: "create" | "update" | "delete";
}

export interface PatchValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  requiresApproval: boolean;
}

export interface CommitResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
  timestamp: number;
}

export interface RollbackSnapshot {
  commitSha: string;
  timestamp: number;
  description: string;
  files: string[];
}

class GitHubUpdateAgent {
  private octokit: InstanceType<typeof Octokit>;
  private owner: string;
  private repo: string;
  private rollbackSnapshots: Map<string, RollbackSnapshot> = new Map();

  constructor(githubToken: string, owner: string, repo: string) {
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }
    this.octokit = new Octokit({ auth: githubToken });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Validate a patch before applying it
   */
  async validatePatch(changes: FileChange[]): Promise<PatchValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresApproval = false;

    // Check number of files
    if (changes.length > SAFETY_CONFIG.MAX_FILES_PER_COMMIT) {
      errors.push(
        `Too many files (${changes.length}). Maximum is ${SAFETY_CONFIG.MAX_FILES_PER_COMMIT}`
      );
    }

    for (const change of changes) {
      // Check forbidden paths
      for (const forbidden of SAFETY_CONFIG.FORBIDDEN_PATHS) {
        if (change.path.startsWith(forbidden)) {
          errors.push(`Forbidden path: ${change.path}`);
        }
      }

      // Check allowed paths
      const isAllowed = SAFETY_CONFIG.ALLOWED_PATHS.some((p) =>
        change.path.startsWith(p)
      );
      if (!isAllowed) {
        errors.push(`Path not in whitelist: ${change.path}`);
      }

      // Check file size
      if (change.content.length > SAFETY_CONFIG.MAX_FILE_SIZE) {
        errors.push(`File too large: ${change.path}`);
      }

      // Check critical files
      const fileName = change.path.split("/").pop() || "";
      if (SAFETY_CONFIG.CRITICAL_FILES.includes(fileName)) {
        warnings.push(`Modifying critical file: ${change.path}`);
        requiresApproval = true;
      }

      // Check for deletions
      if (change.action === "delete") {
        warnings.push(`Deleting file: ${change.path}`);
        requiresApproval = true;
      }

      // Check for dependency changes
      if (change.path === "package.json") {
        warnings.push("Dependency changes detected");
        requiresApproval = true;
      }

      // Check for schema changes
      if (change.path.includes("schema")) {
        warnings.push("Database schema changes detected");
        requiresApproval = true;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      requiresApproval,
    };
  }

  /**
   * Create a rollback snapshot before applying changes
   */
  async createRollbackSnapshot(
    branch: string,
    description: string,
    files: string[]
  ): Promise<RollbackSnapshot> {
    const { data: ref } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${branch}`,
    });

    const snapshot: RollbackSnapshot = {
      commitSha: ref.object.sha,
      timestamp: Date.now(),
      description,
      files,
    };

    this.rollbackSnapshots.set(ref.object.sha, snapshot);
    return snapshot;
  }

  /**
   * Rollback to a previous commit
   */
  async rollback(
    branch: string,
    targetCommitSha: string
  ): Promise<CommitResult> {
    try {
      const snapshot = this.rollbackSnapshots.get(targetCommitSha);
      if (!snapshot) {
        return {
          success: false,
          error: `No rollback snapshot found for commit ${targetCommitSha}`,
          timestamp: Date.now(),
        };
      }

      await this.octokit.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branch}`,
        sha: targetCommitSha,
        force: true,
      });

      return {
        success: true,
        commitSha: targetCommitSha,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Rollback failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Apply a validated patch to the repository
   */
  async applyPatch(
    changes: FileChange[],
    branch: string = "main",
    commitMessage: string = "Jarvis autonomous update"
  ): Promise<CommitResult> {
    try {
      // Validate patch
      const validation = await this.validatePatch(changes);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(", ")}`,
          timestamp: Date.now(),
        };
      }

      // Create rollback snapshot
      const snapshot = await this.createRollbackSnapshot(
        branch,
        commitMessage,
        changes.map((c) => c.path)
      );

      // Get base commit
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branch}`,
      });

      const baseSha = ref.object.sha;

      // Create blobs for each file
      const blobs: Array<{
        path: string;
        mode: "100644" | "100755" | "040000" | "160000" | "120000";
        type: "blob" | "tree" | "commit";
        sha: string;
      }> = [];

      for (const change of changes) {
        if (change.action === "delete") {
          // For deletions, we don't add to the tree
          continue;
        }

        const blob = await this.octokit.git.createBlob({
          owner: this.owner,
          repo: this.repo,
          content: change.content,
          encoding: "utf-8",
        });

        blobs.push({
          path: change.path,
          mode: "100644",
          type: "blob",
          sha: blob.data.sha,
        });
      }

      // Create tree
      const { data: tree } = await this.octokit.git.createTree({
        owner: this.owner,
        repo: this.repo,
        base_tree: baseSha,
        tree: blobs,
      });

      // Create commit
      const { data: commit } = await this.octokit.git.createCommit({
        owner: this.owner,
        repo: this.repo,
        message: commitMessage,
        tree: tree.sha,
        parents: [baseSha],
      });

      // Update branch reference
      await this.octokit.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branch}`,
        sha: commit.sha,
      });

      // Tag the commit
      const tag = `jarvis-${Date.now()}`;
      await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/tags/${tag}`,
        sha: commit.sha,
      });

      return {
        success: true,
        commitSha: commit.sha,
        commitUrl: `https://github.com/${this.owner}/${this.repo}/commit/${commit.sha}`,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to apply patch: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get commit history for audit trail
   */
  async getCommitHistory(branch: string = "main", limit: number = 10) {
    try {
      const { data: commits } = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: branch,
        per_page: limit,
      });

      return commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        timestamp: commit.commit.author?.date,
        url: commit.html_url,
      }));
    } catch (error) {
      throw new Error(
        `Failed to get commit history: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get current branch status
   */
  async getBranchStatus(branch: string = "main") {
    try {
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branch}`,
      });

      return {
        branch,
        commitSha: ref.object.sha,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(
        `Failed to get branch status: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export singleton instance
let agentInstance: GitHubUpdateAgent | null = null;

export function getGitHubUpdateAgent(): GitHubUpdateAgent {
  if (!agentInstance) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is not set");
    }
    agentInstance = new GitHubUpdateAgent(
      token,
      "lwrnckahiga88",
      "copy-of-copy-of-jua-kali-clinical-intelligence-hub"
    );
  }
  return agentInstance;
}

export { GitHubUpdateAgent };

// ─── Compatibility shims for new agent-graph / RL modules ─────────────────────

export type RepoPatch = { path: string; content: string };

export interface PatchResult {
  success: boolean;
  commitSha?: string;
  patchedFiles: string[];
  blockedFiles: string[];
  error?: string;
}

/**
 * Functional wrapper around the class-based agent — used by RL / patch engine
 */
export async function applyRepoPatch(opts: {
  owner: string;
  repo: string;
  branch?: string;
  changes: RepoPatch[];
  commitMessage?: string;
}): Promise<PatchResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { success: false, error: "GITHUB_TOKEN not configured", patchedFiles: [], blockedFiles: [] };
  }

  const agent = new GitHubUpdateAgent(token, opts.owner, opts.repo);

  const fileChanges: FileChange[] = opts.changes.map((c) => ({
    path: c.path,
    content: c.content,
    action: "update" as const,
  }));

  const result = await agent.applyPatch(
    fileChanges,
    opts.branch ?? "main",
    opts.commitMessage ?? "[JGA] Autonomous update"
  );

  return {
    success: result.success,
    commitSha: result.commitSha,
    patchedFiles: result.success ? opts.changes.map((c) => c.path) : [],
    blockedFiles: [],
    error: result.error,
  };
}
