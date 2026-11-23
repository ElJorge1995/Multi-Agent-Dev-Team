"use client";

import React from "react";
import { ITask, TaskStatus } from "@/types";
import {
  Clock,
  Code2,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Check,
} from "lucide-react";

interface TaskPipelineProps {
  tasks: ITask[];
  activeTaskId?: string;
}

export function TaskPipeline({ tasks, activeTaskId }: TaskPipelineProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
        <Clock className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Esperando solicitud...
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Escribe un requerimiento abajo o selecciona un ejemplo para que el Orquestador genere las tareas.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: TaskStatus, iterations: number) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse">
            <Code2 className="w-3 h-3" /> Desarrollando
          </span>
        );
      case "TESTING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="w-3 h-3" /> En Testeo
          </span>
        );
      case "RETRYING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <RotateCcw className="w-3 h-3 animate-spin" /> Corrigiendo (v{iterations})
          </span>
        );
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Aprobado
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300">
            Fallido
          </span>
        );
    }
  };

  const completedCount = tasks.filter((t) => t.status === "PASSED").length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header bar with progress */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            Pipeline de Tareas del Orquestador
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {completedCount} de {tasks.length} tareas aprobadas por Testing ({progressPercent}%)
          </p>
        </div>
        <div className="w-32 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task list cards */}
      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const isActive = task.id === activeTaskId || task.status === "IN_PROGRESS" || task.status === "TESTING" || task.status === "RETRYING";
          const isPassed = task.status === "PASSED";

          return (
            <div
              key={task.id || idx}
              className={`p-4 rounded-xl border transition-all ${
                isActive
                  ? "bg-white dark:bg-zinc-900 border-blue-500/80 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/30"
                  : isPassed
                  ? "bg-zinc-50/60 dark:bg-zinc-900/40 border-emerald-500/30"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isPassed
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                    {task.title}
                  </h4>
                </div>
                <div>{getStatusBadge(task.status, task.iterations)}</div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-8 mb-2 leading-relaxed">
                {task.description}
              </p>

              {/* Criteria list */}
              {task.testCriteria && task.testCriteria.length > 0 && (
                <div className="pl-8 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                    Criterios verificados por Testing:
                  </span>
                  <ul className="space-y-1">
                    {task.testCriteria.map((c, cIdx) => (
                      <li
                        key={cIdx}
                        className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPassed ? "bg-emerald-500" : "bg-zinc-400"
                          }`}
                        />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
