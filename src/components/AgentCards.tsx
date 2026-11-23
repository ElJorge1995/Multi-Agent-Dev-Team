"use client";

import React from "react";
import { AgentRole, AgentStatus } from "@/types";
import {
  Compass,
  Code2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface AgentStateInfo {
  status: AgentStatus;
  message?: string;
}

interface AgentCardsProps {
  agentStates: Record<AgentRole, AgentStateInfo>;
}

export function AgentCards({ agentStates }: AgentCardsProps) {
  const agents: Array<{
    role: AgentRole;
    name: string;
    description: string;
    icon: typeof Compass;
    accentColor: string;
    borderActive: string;
  }> = [
    {
      role: "ORCHESTRATOR",
      name: "1. Orquestador",
      description: "Recibe el objetivo, desglosa en tareas y coordina el flujo.",
      icon: Compass,
      accentColor: "from-purple-500 to-indigo-600",
      borderActive: "border-purple-500 ring-2 ring-purple-500/30",
    },
    {
      role: "DEVELOP",
      name: "2. Develop",
      description: "Construye el código Next.js/TS y aplica correcciones.",
      icon: Code2,
      accentColor: "from-blue-500 to-cyan-600",
      borderActive: "border-blue-500 ring-2 ring-blue-500/30",
    },
    {
      role: "TESTING",
      name: "3. Testing",
      description: "Ejecuta pruebas, detecta fallos y valida hasta 100% aprobado.",
      icon: CheckCircle2,
      accentColor: "from-emerald-500 to-teal-600",
      borderActive: "border-emerald-500 ring-2 ring-emerald-500/30",
    },
  ];

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case "thinking":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            <Sparkles className="w-3 h-3 animate-spin" />
            Pensando...
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Codificando
          </span>
        );
      case "reviewing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            Testeando
          </span>
        );
      case "retrying":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <RotateCcw className="w-3 h-3 animate-spin" />
            Bucle corrección
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-3 h-3" />
            Detectó fallo
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Completado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Inactivo
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {agents.map((agent) => {
        const state = agentStates[agent.role] || { status: "idle" };
        const isActive =
          state.status === "thinking" ||
          state.status === "active" ||
          state.status === "reviewing" ||
          state.status === "retrying";
        const Icon = agent.icon;

        return (
          <div
            key={agent.role}
            className={`relative rounded-xl p-5 bg-white dark:bg-zinc-900 border transition-all duration-300 shadow-sm ${
              isActive
                ? agent.borderActive
                : state.status === "completed"
                ? "border-emerald-500/50"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${agent.accentColor} flex items-center justify-center text-white shadow`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {agent.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-xs text-zinc-400">Estado:</span>
              {getStatusBadge(state.status)}
            </div>

            {/* Active message / speech bubble */}
            {state.message && (
              <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 animate-fade-in">
                <span className="text-blue-500 font-bold shrink-0">›</span>
                <p className="leading-relaxed line-clamp-2">{state.message}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
