import React, { useMemo, useCallback } from "react";
import { ComponentNode, RuntimeAction, AgentHook } from "@shared/agent-types";

interface AgentRendererProps {
  componentGraph: ComponentNode;
  agentId: string;
  onAction?: (action: RuntimeAction, params?: Record<string, unknown>) => void;
  data?: Record<string, unknown>;
  loading?: boolean;
  error?: string | null;
}

/**
 * AgentRenderer
 * Renders a component graph into React components
 * Handles hooks, actions, and live data binding
 */
export default function AgentRenderer({
  componentGraph,
  agentId,
  onAction,
  data = {},
  loading = false,
  error,
}: AgentRendererProps) {
  const renderNode = useCallback(
    (node: ComponentNode | null | undefined, depth: number = 0): React.ReactNode => {
      if (!node) return null;

      const {
        id,
        type,
        props,
        children,
        actions,
        hooks,
      } = node;

      // Build element props
      const elementProps: Record<string, unknown> = {
        key: id,
        className: `${props.class || props.className || ""} ${
          depth === 0 ? "agent-root" : ""
        }`.trim(),
      };

      // Copy relevant props
      const copyProps = [
        "id",
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
        "role",
        "aria-label",
      ];

      for (const prop of copyProps) {
        if (prop in props) {
          elementProps[prop] = props[prop];
        }
      }

      // Add action handlers
      if (actions && actions.length > 0) {
        actions.forEach((action) => {
          if (action.type === "mutation") {
            elementProps.onClick = () => {
              if (onAction) {
                onAction(action, action.params);
              }
            };
          }
        });
      }

      // Render children
      let childContent: React.ReactNode = null;
      if (children && children.length > 0) {
        childContent = children.map((child) => renderNode(child, depth + 1));
      } else if (props.children) {
        childContent = props.children as React.ReactNode;
      }

      // Create element based on type
      const Element = type as string;

      try {
        return React.createElement(
          Element as any,
          elementProps as any,
          childContent
        );
      } catch (err) {
        console.error(`Failed to render component ${id}:`, err);
        return (
          <div
            key={id}
            className="p-4 bg-red-900/20 border border-red-500 rounded text-red-400"
          >
            Error rendering {type}
          </div>
        );
      }
    },
    [onAction]
  );

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-400">
        <p className="font-semibold">Error loading agent</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!componentGraph) {
    return (
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded text-slate-400">
        No component graph available
      </div>
    );
  }

  return (
    <div className="agent-renderer w-full">
      {renderNode(componentGraph)}
    </div>
  );
}

/**
 * useAgent Hook
 * Manages agent lifecycle and state
 */
export function useAgent(agentId: string) {
  const [state, setState] = React.useState<Record<string, unknown>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const executeAction = useCallback(
    async (action: RuntimeAction, params?: Record<string, unknown>) => {
      setLoading(true);
      setError(null);

      try {
        // Action execution logic would go here
        // For now, just update state
        setState((prev) => ({
          ...prev,
          lastAction: action.name,
          lastParams: params,
          executedAt: Date.now(),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    state,
    loading,
    error,
    executeAction,
    setState,
  };
}

/**
 * AgentContainer
 * Wrapper component for agents with lifecycle management
 */
interface AgentContainerProps {
  agentId: string;
  componentGraph?: ComponentNode;
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
}

export function AgentContainer({
  agentId,
  componentGraph,
  loading,
  error,
  children,
}: AgentContainerProps) {
  return (
    <div className="agent-container w-full">
      <div className="agent-wrapper bg-slate-900/50 border border-cyan-500/30 rounded-lg overflow-hidden">
        {children || (
          componentGraph && (
            <AgentRenderer
              componentGraph={componentGraph}
              agentId={agentId}
              loading={loading}
              error={error}
            />
          )
        )}
      </div>
    </div>
  );
}
