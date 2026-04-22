/**
 * GitHub API Fetcher
 * Fetches HTML pages from lwrnckahiga88/health-ai repository
 * and parses them into agent modules
 */

import { z } from 'zod';

export interface GitHubFile {
  name: string;
  path: string;
  size: number;
  download_url: string;
  type: string;
}

export interface AgentModule {
  id: string;
  name: string;
  description: string;
  category: string;
  htmlUrl: string;
  rawContent?: string;
  functionality: string[];
  icon?: string;
  status: 'active' | 'inactive' | 'testing';
}

/**
 * Categorize HTML files by functionality
 */
function categorizeFile(filename: string): {
  category: string;
  functionality: string[];
  description: string;
} {
  const name = filename.toLowerCase();

  // Patient Management & Vitals
  if (name.includes('nurse') || name.includes('patient') || name.includes('vitals')) {
    return {
      category: 'Patient Management',
      functionality: ['patient-monitoring', 'vitals-tracking', 'triage'],
      description: 'Patient monitoring and vital signs management',
    };
  }

  // Analytics & Epidemiology
  if (
    name.includes('pandemic') ||
    name.includes('seird') ||
    name.includes('epidemic') ||
    name.includes('analytics')
  ) {
    return {
      category: 'Analytics & Epidemiology',
      functionality: ['predictive-analytics', 'disease-modeling', 'trend-analysis'],
      description: 'Epidemiological modeling and disease analytics',
    };
  }

  // Workflow & Protocol Management
  if (
    name.includes('workflow') ||
    name.includes('builder') ||
    name.includes('protocol') ||
    name.includes('langflow')
  ) {
    return {
      category: 'Workflow Management',
      functionality: ['workflow-design', 'protocol-management', 'automation'],
      description: 'Clinical workflow and protocol management',
    };
  }

  // Genomics & Molecular
  if (name.includes('genomic') || name.includes('genetic') || name.includes('quorum')) {
    return {
      category: 'Genomics & Molecular',
      functionality: ['genetic-analysis', 'molecular-testing', 'sequencing'],
      description: 'Genomic and molecular analysis tools',
    };
  }

  // Lab & Testing
  if (
    name.includes('chem') ||
    name.includes('lab') ||
    name.includes('test') ||
    name.includes('workbench')
  ) {
    return {
      category: 'Laboratory',
      functionality: ['lab-testing', 'sample-analysis', 'results-reporting'],
      description: 'Laboratory testing and analysis',
    };
  }

  // Clinical Validation
  if (name.includes('valid') || name.includes('validation')) {
    return {
      category: 'Clinical Validation',
      functionality: ['data-validation', 'quality-assurance', 'compliance'],
      description: 'Clinical data validation and quality assurance',
    };
  }

  // Monitoring & Alerts
  if (name.includes('monitor') || name.includes('alert') || name.includes('stream')) {
    return {
      category: 'Monitoring & Alerts',
      functionality: ['real-time-monitoring', 'alerting', 'notifications'],
      description: 'Real-time monitoring and alert management',
    };
  }

  // Default: Other Clinical Tools
  return {
    category: 'Clinical Tools',
    functionality: ['general-clinical-support'],
    description: 'General clinical support tools',
  };
}

/**
 * Fetch all HTML files from GitHub repository
 */
export async function fetchHealthAIFiles(): Promise<GitHubFile[]> {
  const apiUrl =
    'https://api.github.com/repos/lwrnckahiga88/health-ai/contents/public';

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const files = (await response.json()) as GitHubFile[];

    // Filter only HTML files
    return files.filter((f) => f.type === 'file' && f.name.endsWith('.html'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch health-ai files: ${message}`);
  }
}

/**
 * Convert GitHub HTML file to agent module
 */
export function convertToAgentModule(file: GitHubFile): AgentModule {
  const { category, functionality, description } = categorizeFile(file.name);

  // Generate ID from filename
  const id = file.name
    .replace('.html', '')
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase();

  // Generate display name
  const name = file.name
    .replace('.html', '')
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  return {
    id,
    name,
    description,
    category,
    htmlUrl: file.download_url,
    functionality,
    status: 'active',
  };
}

/**
 * Fetch and parse all health-ai HTML pages into agent modules
 */
export async function fetchAndParseAgents(): Promise<AgentModule[]> {
  const files = await fetchHealthAIFiles();
  return files.map(convertToAgentModule);
}

/**
 * Group agents by category
 */
export function groupAgentsByCategory(
  agents: AgentModule[]
): Record<string, AgentModule[]> {
  return agents.reduce(
    (acc, agent) => {
      if (!acc[agent.category]) {
        acc[agent.category] = [];
      }
      acc[agent.category].push(agent);
      return acc;
    },
    {} as Record<string, AgentModule[]>
  );
}

/**
 * Fetch HTML content from raw GitHub URL
 */
export async function fetchHtmlContent(htmlUrl: string): Promise<string> {
  try {
    const response = await fetch(htmlUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch HTML: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch HTML content: ${message}`);
  }
}

/**
 * Extract key information from HTML content
 */
export function extractHtmlMetadata(htmlContent: string): {
  title: string;
  description: string;
  hasForm: boolean;
  hasChart: boolean;
  hasTable: boolean;
} {
  // Extract title
  const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Extract meta description
  const descMatch = htmlContent.match(
    /<meta\s+name="description"\s+content="([^"]+)"/i
  );
  const description = descMatch ? descMatch[1] : '';

  // Check for common elements
  const hasForm = /<form[^>]*>/i.test(htmlContent);
  const hasChart =
    /<canvas|<svg|recharts|chart\.js|plotly/i.test(htmlContent);
  const hasTable = /<table[^>]*>/i.test(htmlContent);

  return {
    title,
    description,
    hasForm,
    hasChart,
    hasTable,
  };
}

/**
 * Schema for agent module validation
 */
export const AgentModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  htmlUrl: z.string().url(),
  functionality: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'testing']),
  rawContent: z.string().optional(),
});

export type ValidatedAgentModule = z.infer<typeof AgentModuleSchema>;
