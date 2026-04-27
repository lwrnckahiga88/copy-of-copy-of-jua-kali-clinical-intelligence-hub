/**
 * UI Compiler
 * Transforms HTML pages into structured component graphs.
 * Pure string/regex implementation — zero jsdom/DOM dependency.
 */

import {
  ComponentNode,
  UICompilationResult,
  AgentHook,
  RuntimeAction,
} from "@shared/agent-types";

const HTML_TO_COMPONENT: Record<string, string> = {
  div:"div", span:"span", p:"p", h1:"h1", h2:"h2", h3:"h3",
  h4:"h4", h5:"h5", h6:"h6", button:"button", input:"input",
  textarea:"textarea", select:"select", form:"form", table:"table",
  tr:"tr", td:"td", th:"th", ul:"ul", ol:"ol", li:"li", a:"a",
  img:"img", video:"video", canvas:"canvas", section:"section",
  article:"article", nav:"nav", header:"header", footer:"footer",
  main:"main", aside:"aside",
};

const TEXT_ELEMENTS = new Set(["p","span","h1","h2","h3","h4","h5","h6","button","a"]);

/** Extract attribute value from raw tag string */
function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}=["']([^"']*)["']`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

/** Extract all attributes as key→value map */
function extractProps(tag: string, tagName: string, textContent: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const stdAttrs = ["id","class","style","type","placeholder","value",
    "disabled","readonly","required","checked","selected","href","src",
    "alt","title","data-testid"];
  for (const a of stdAttrs) {
    const v = attr(tag, a);
    if (v !== null) props[a] = v;
  }
  if (TEXT_ELEMENTS.has(tagName) && textContent) {
    props.children = textContent.trim();
  }
  return props;
}

/** Parse data-hooks JSON attribute */
function extractHooks(tag: string): AgentHook[] {
  const raw = attr(tag, "data-hooks");
  if (!raw) return [];
  try {
    const configs = JSON.parse(raw);
    if (!Array.isArray(configs)) return [];
    return configs.map((c, i) => ({
      id: `hook-${i}`, type: c.type || "useEffect",
      config: c.config || {}, dependencies: c.dependencies,
    }));
  } catch { return []; }
}

/** Parse data-actions JSON attribute */
function extractActions(tag: string): RuntimeAction[] {
  const raw = attr(tag, "data-actions");
  if (!raw) return [];
  try {
    const configs = JSON.parse(raw);
    if (!Array.isArray(configs)) return [];
    return configs.map((c, i) => ({
      id: `action-${i}`, name: c.name || `action-${i}`,
      type: c.type || "mutation", handler: c.handler || "",
      params: c.params,
    }));
  } catch { return []; }
}

interface Token { tagName: string; raw: string; isClose: boolean; isSelf: boolean; text: string; }

/** Tokenise HTML into open/close/self-closing tags + text content */
function tokenise(html: string): Token[] {
  const tokens: Token[] = [];
  const re = /<(\/?)(\w+)([^>]*)(\/?)\s*>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[5]) {
      // text node — attach to last open token
      const last = tokens[tokens.length - 1];
      if (last && !last.isClose) last.text += m[5];
    } else {
      const isClose = m[1] === "/";
      const isSelf = m[4] === "/" || /^(input|img|br|hr|meta|link)$/i.test(m[2]);
      tokens.push({ tagName: m[2].toLowerCase(), raw: m[0], isClose, isSelf, text: "" });
    }
  }
  return tokens;
}

/** Build ComponentNode tree from token list, starting at index */
function buildTree(
  tokens: Token[], idx: number, agentId: string, depth: number
): { node: ComponentNode; nextIdx: number } {
  const tok = tokens[idx];
  const id = `${agentId}-${tok.tagName}-${depth}-${Math.random().toString(36).slice(2,9)}`;
  const type = HTML_TO_COMPONENT[tok.tagName] || "div";
  const props = extractProps(tok.raw, tok.tagName, tok.text);
  const hooks = extractHooks(tok.raw);
  const actions = extractActions(tok.raw);
  const children: ComponentNode[] = [];

  let i = idx + 1;
  if (!tok.isSelf) {
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.isClose && t.tagName === tok.tagName) { i++; break; }
      if (!t.isClose) {
        const { node, nextIdx } = buildTree(tokens, i, agentId, depth + 1);
        children.push(node);
        i = nextIdx;
      } else {
        i++;
      }
    }
  }

  const node: ComponentNode = {
    id, type, props,
    ...(children.length ? { children } : {}),
    ...(hooks.length ? { hooks } : {}),
    ...(actions.length ? { actions } : {}),
  };
  return { node, nextIdx: i };
}

class UICompiler {
  static compileHTML(html: string, options?: { agentId?: string }): UICompilationResult {
    try {
      const agentId = options?.agentId || "agent";

      // Find main content: <main>, [role="main"], .content, or <body>
      const mainRe = /<main[\s>]|role=["']main["']|class=["'][^"']*content[^"']*["']|<body[\s>]/i;
      const mainMatch = mainRe.exec(html);
      const slice = mainMatch ? html.slice(mainMatch.index) : html;

      const tokens = tokenise(slice).filter(t => !t.isClose || t.isSelf);
      if (tokens.length === 0) {
        return { success: false, errors: [{ message: "No content found in HTML" }] };
      }

      const allTokens = tokenise(slice);
      const firstOpen = allTokens.findIndex(t => !t.isClose);
      if (firstOpen === -1) {
        return { success: false, errors: [{ message: "No parseable elements found" }] };
      }

      const { node } = buildTree(allTokens, firstOpen, agentId, 0);
      return { success: true, componentGraph: node };
    } catch (error) {
      return {
        success: false,
        errors: [{ message: `Compilation error: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  }

  static validate(graph: ComponentNode): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!graph.id) errors.push("Component node must have an id");
    if (!graph.type) errors.push("Component node must have a type");
    graph.children?.forEach((child, i) => {
      const r = this.validate(child);
      if (!r.valid) errors.push(`Child ${i}: ${r.errors.join(", ")}`);
    });
    return { valid: errors.length === 0, errors };
  }

  static optimize(graph: ComponentNode): ComponentNode {
    if (graph.children) {
      graph.children = graph.children
        .filter(c => c.children?.length || Object.keys(c.props).length || c.hooks?.length || c.actions?.length)
        .map(c => this.optimize(c));
    }
    return graph;
  }

  static serialize(graph: ComponentNode): string { return JSON.stringify(graph, null, 2); }
  static deserialize(json: string): ComponentNode { return JSON.parse(json); }
}

export default UICompiler;
