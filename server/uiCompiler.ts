/**
 * UI Compiler
 * Transforms HTML pages into structured component graphs
 */

import {
  ComponentNode,
  UICompilationResult,
  AgentHook,
  RuntimeAction,
} from "@shared/agent-types";
import { JSDOM } from "jsdom";

class UICompiler {
  /**
   * Compile HTML to component graph
   */
  static compileHTML(html: string, options?: { agentId?: string }): UICompilationResult {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Find main content area
      const mainElement =
        document.querySelector("main") ||
        document.querySelector("[role='main']") ||
        document.querySelector(".content") ||
        document.body;

      if (!mainElement) {
        return {
          success: false,
          errors: [{ message: "No main content area found in HTML" }],
        };
      }

      // Parse HTML to component graph
      const componentGraph = this.parseElement(mainElement, options?.agentId);

      return {
        success: true,
        componentGraph,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            message: `Compilation error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  /**
   * Parse DOM element to component node
   */
  private static parseElement(
    element: Element,
    agentId?: string,
    depth: number = 0
  ): ComponentNode {
    const tagName = element.tagName.toLowerCase();
    const componentType = this.mapHTMLToComponent(tagName);
    const props = this.extractProps(element);
    const id = `${agentId || "agent"}-${tagName}-${depth}-${Math.random().toString(36).substr(2, 9)}`;

    // Parse children
    const children: ComponentNode[] = [];
    const childElements = Array.from(element.children);
    for (const child of childElements) {
      if (child.nodeType === 1) {
        // Element node
        children.push(this.parseElement(child, agentId, depth + 1));
      }
    }

    // Extract hooks and actions from data attributes
    const hooks = this.extractHooks(element);
    const actions = this.extractActions(element);

    return {
      id,
      type: componentType,
      props,
      children: children.length > 0 ? children : undefined,
      hooks: hooks.length > 0 ? hooks : undefined,
      actions: actions.length > 0 ? actions : undefined,
    };
  }

  /**
   * Map HTML tags to React components
   */
  private static mapHTMLToComponent(tagName: string): string {
    const mapping: Record<string, string> = {
      div: "div",
      span: "span",
      p: "p",
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      h5: "h5",
      h6: "h6",
      button: "button",
      input: "input",
      textarea: "textarea",
      select: "select",
      form: "form",
      table: "table",
      tr: "tr",
      td: "td",
      th: "th",
      ul: "ul",
      ol: "ol",
      li: "li",
      a: "a",
      img: "img",
      video: "video",
      canvas: "canvas",
      section: "section",
      article: "article",
      nav: "nav",
      header: "header",
      footer: "footer",
      main: "main",
      aside: "aside",
    };

    return mapping[tagName] || "div";
  }

  /**
   * Extract props from element
   */
  private static extractProps(element: Element): Record<string, unknown> {
    const props: Record<string, unknown> = {};

    // Copy standard attributes
    const standardAttrs = [
      "id",
      "class",
      "style",
      "type",
      "placeholder",
      "value",
      "disabled",
      "readonly",
      "required",
      "checked",
      "selected",
      "href",
      "src",
      "alt",
      "title",
      "data-testid",
    ];

    for (const attr of standardAttrs) {
      if (element.hasAttribute(attr)) {
        props[attr] = element.getAttribute(attr);
      }
    }

    // Extract text content for certain elements
    const textElements = ["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "button", "a"];
    if (textElements.includes(element.tagName.toLowerCase())) {
      props.children = element.textContent || "";
    }

    return props;
  }

  /**
   * Extract hooks from data attributes
   */
  private static extractHooks(element: Element): AgentHook[] {
    const hooks: AgentHook[] = [];
    const hooksAttr = element.getAttribute("data-hooks");

    if (hooksAttr) {
      try {
        const hookConfigs = JSON.parse(hooksAttr);
        if (Array.isArray(hookConfigs)) {
          hookConfigs.forEach((config, index) => {
            hooks.push({
              id: `hook-${index}`,
              type: config.type || "useEffect",
              config: config.config || {},
              dependencies: config.dependencies,
            });
          });
        }
      } catch (error) {
        console.warn("Failed to parse hooks:", error);
      }
    }

    return hooks;
  }

  /**
   * Extract actions from data attributes
   */
  private static extractActions(element: Element): RuntimeAction[] {
    const actions: RuntimeAction[] = [];
    const actionsAttr = element.getAttribute("data-actions");

    if (actionsAttr) {
      try {
        const actionConfigs = JSON.parse(actionsAttr);
        if (Array.isArray(actionConfigs)) {
          actionConfigs.forEach((config, index) => {
            actions.push({
              id: `action-${index}`,
              name: config.name || `action-${index}`,
              type: config.type || "mutation",
              handler: config.handler || "",
              params: config.params,
            });
          });
        }
      } catch (error) {
        console.warn("Failed to parse actions:", error);
      }
    }

    return actions;
  }

  /**
   * Validate component graph
   */
  static validate(graph: ComponentNode): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!graph.id) errors.push("Component node must have an id");
    if (!graph.type) errors.push("Component node must have a type");

    // Recursively validate children
    if (graph.children) {
      graph.children.forEach((child, index) => {
        const childValidation = this.validate(child);
        if (!childValidation.valid) {
          errors.push(`Child ${index}: ${childValidation.errors.join(", ")}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Optimize component graph (remove unused nodes, merge simple elements)
   */
  static optimize(graph: ComponentNode): ComponentNode {
    // Remove empty text nodes
    if (graph.children) {
      graph.children = graph.children.filter((child) => {
        const hasContent =
          child.children?.length || Object.keys(child.props).length > 0;
        return hasContent || child.hooks?.length || child.actions?.length;
      });

      // Recursively optimize children
      graph.children = graph.children.map((child) => this.optimize(child));
    }

    return graph;
  }

  /**
   * Serialize component graph to JSON
   */
  static serialize(graph: ComponentNode): string {
    return JSON.stringify(graph, null, 2);
  }

  /**
   * Deserialize component graph from JSON
   */
  static deserialize(json: string): ComponentNode {
    return JSON.parse(json);
  }
}

export default UICompiler;
