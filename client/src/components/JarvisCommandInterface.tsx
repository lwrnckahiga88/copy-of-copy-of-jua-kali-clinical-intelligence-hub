import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Terminal, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentSuggestions?: string[];
}

interface JarvisCommandInterfaceProps {
  onNavigateToAgent?: (agentId: string) => void;
  className?: string;
}

const SYSTEM_PROMPT = `You are Jarvis, the AI command interface for the juA.kali Clinical Intelligence Hub — a healthcare platform built for Kenya and East Africa, integrating clinical decision support, health financing (SHIF, M-Pesa), and AI-powered tools.

The platform has these modules:
- NurseAI: Patient vitals, care plans, triage
- Analytics & Epidemiology: Disease modeling, SEIRD, predictive analytics
- Triad Neuro: EEG and neurological analysis
- Cerberus BPU: Wearable device integration, clinical alerts
- MedOS Module: Core medical OS tools
- Intervention Planner: Clinical protocols and interventions
- Agent Debate: Multi-agent clinical reasoning
- Health AI Agents: 82+ specialized HTML-based clinical modules from GitHub
- Nexus Dashboard: Aggregated overview
- Connector UI: External service integrations
- Jarvis: This agent orchestration layer

Answer clinical queries concisely, route users to the right module, and explain AI outputs in plain language. Always ground clinical information in evidence. When unsure, say so.`;

/**
 * Phase 5: LLM-powered Natural Language Command Interface
 * Integrates Claude API for conversational agent orchestration
 */
export function JarvisCommandInterface({
  onNavigateToAgent,
  className = "",
}: JarvisCommandInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Jarvis online. I can help you navigate the platform, answer clinical questions, or route you to the right module. What do you need?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build conversation history for API
    const history = [...messages, userMsg]
      .filter((m) => m.id !== "welcome" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantText =
        data.content
          ?.filter((b: any) => b.type === "text")
          .map((b: any) => b.text)
          .join("") ?? "No response received.";

      // Extract any agent suggestions from response
      const agentKeywords: Record<string, string> = {
        nurse: "nurseai",
        analytics: "analytics",
        neuro: "triad-neuro",
        wearable: "cerberus-bpu",
        cerberus: "cerberus-bpu",
        modos: "medos-module",
        intervention: "intervention-planner",
        debate: "agent-debate",
        jarvis: "jarvis",
        nexus: "nexus-dashboard",
      };

      const lower = assistantText.toLowerCase();
      const agentSuggestions = Object.entries(agentKeywords)
        .filter(([keyword]) => lower.includes(keyword))
        .map(([, agentId]) => agentId)
        .filter((v, i, a) => a.indexOf(v) === i) // deduplicate
        .slice(0, 2);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantText,
        timestamp: new Date(),
        agentSuggestions: agentSuggestions.length > 0 ? agentSuggestions : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Connection error: ${err instanceof Error ? err.message : String(err)}. Check your network and try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Conversation cleared. How can I assist you?",
        timestamp: new Date(),
      },
    ]);
  };

  const agentLabel: Record<string, string> = {
    "nurseai": "NurseAI",
    "analytics": "Analytics",
    "triad-neuro": "Triad Neuro",
    "cerberus-bpu": "Cerberus BPU",
    "medos-module": "MedOS Module",
    "intervention-planner": "Intervention Planner",
    "agent-debate": "Agent Debate",
    "jarvis": "Jarvis",
    "nexus-dashboard": "Nexus Dashboard",
  };

  return (
    <Card
      className={`bg-slate-950/90 border-cyan-500/40 overflow-hidden flex flex-col ${className}`}
      style={{ boxShadow: "0 0 20px rgba(6,182,212,0.08)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 cursor-pointer select-none"
        onClick={() => setIsCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" />
          </div>
          <span className="text-sm font-mono font-semibold text-cyan-300 tracking-wider uppercase">
            Jarvis Command Interface
          </span>
          <Sparkles className="w-3 h-3 text-cyan-500/60" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); clearHistory(); }}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
            title="Clear history"
          >
            <X className="w-3 h-3" />
          </button>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                  </div>
                )}
                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`text-xs rounded-lg px-3 py-2 font-mono leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 ml-auto"
                        : "bg-slate-800/80 text-slate-200 border border-slate-700/50"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Agent navigation suggestions */}
                  {msg.agentSuggestions && msg.agentSuggestions.length > 0 && onNavigateToAgent && (
                    <div className="flex flex-wrap gap-1">
                      {msg.agentSuggestions.map((agentId) => (
                        <button
                          key={agentId}
                          onClick={() => onNavigateToAgent(agentId)}
                          className="text-xs px-2 py-0.5 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-500/30 rounded transition-colors font-mono"
                        >
                          → {agentLabel[agentId] ?? agentId}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-600 px-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2">
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-cyan-500/20 p-3 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Jarvis anything… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 resize-none bg-slate-900 border border-slate-700 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none transition-colors"
              style={{ minHeight: "36px", maxHeight: "100px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "36px";
                t.style.height = `${Math.min(t.scrollHeight, 100)}px`;
              }}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-500 text-white border-0 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
