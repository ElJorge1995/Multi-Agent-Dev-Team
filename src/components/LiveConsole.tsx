"use client";

import React, { useState, useEffect, useRef } from "react";
import { IAgentLog, AgentRole } from "@/types";
import {
  Terminal,
  Compass,
  Code2,
  ShieldCheck,
  Copy,
  Check,
  ArrowDownCircle,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

interface LiveConsoleProps {
  logs: IAgentLog[];
}

export function LiveConsole({ logs }: LiveConsoleProps) {
  const [filter, setFilter] = useState<AgentRole | "ALL">("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return log.agent === filter;
  });

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.agent}] [${l.type.toUpperCase()}] ${l.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAgentBadge = (agent: AgentRole) => {
    switch (agent) {
      case "ORCHESTRATOR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Compass className="w-3 h-3" /> Orquestador
          </span>
        );
      case "DEVELOP":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Code2 className="w-3 h-3" /> Develop
          </span>
        );
      case "TESTING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> Testing
          </span>
        );
    }
  };

  const getBorderColor = (type: IAgentLog["type"]) => {
    switch (type) {
      case "thought":
        return "border-l-blue-500/60 bg-blue-950/10";
      case "action":
        return "border-l-indigo-500/60 bg-indigo-950/10";
      case "feedback":
      case "error":
        return "border-l-amber-500 bg-amber-950/20";
      case "test_result":
        return "border-l-emerald-500 bg-emerald-950/20";
      default:
        return "border-l-zinc-700 bg-zinc-900/30";
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0d1117] text-zinc-300 overflow-hidden flex flex-col h-[520px] shadow-lg">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold text-zinc-200">
            agent-activity.log
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            ({logs.length} eventos)
          </span>
        </div>

        {/* Filters and actions */}
        <div className="flex items-center gap-2">
          {/* Agent Filter tabs */}
          <div className="flex rounded-lg bg-zinc-800/80 p-0.5 text-xs">
            {(["ALL", "ORCHESTRATOR", "DEVELOP", "TESTING"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  filter === tab
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab === "ALL" ? "Todos" : tab === "ORCHESTRATOR" ? "Orquestador" : tab === "DEVELOP" ? "Develop" : "Testing"}
              </button>
            ))}
          </div>

          {/* Auto scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Pausar autoscroll" : "Activar autoscroll"}
            className={`p-1.5 rounded text-xs transition ${
              autoScroll ? "text-emerald-400 bg-emerald-950/40" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopyLogs}
            title="Copiar logs"
            className="p-1.5 rounded text-zinc-400 hover:text-white transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal log stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs leading-relaxed">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 italic">
            Esperando eventos de los agentes...
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={log.id || idx}
              className={`p-3 rounded-md border-l-2 ${getBorderColor(
                log.type
              )} transition-all`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {getAgentBadge(log.agent)}
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                    [{log.type}]
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatTimestamp(log.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-zinc-200 text-xs">
                {log.content}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
