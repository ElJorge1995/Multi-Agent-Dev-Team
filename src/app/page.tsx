"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AgentCards } from "@/components/AgentCards";
import { TaskPipeline } from "@/components/TaskPipeline";
import { LiveConsole } from "@/components/LiveConsole";
import { ArtifactViewer } from "@/components/ArtifactViewer";
import { PromptSection } from "@/components/PromptSection";
import { SettingsModal } from "@/components/SettingsModal";
import { ExplanationModal } from "@/components/ExplanationModal";
import {
  AgentRole,
  AgentStatus,
  ITask,
  IAgentLog,
  IArtifact,
  StreamEvent,
} from "@/types";
import { Terminal, FileCode2, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function Home() {
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    provider: "Verificando...",
  });
  const [mode, setMode] = useState<"mock" | "live">("mock");
  const [apiKey, setApiKey] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"console" | "code">("console");
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Agent states
  const [agentStates, setAgentStates] = useState<
    Record<AgentRole, { status: AgentStatus; message?: string }>
  >({
    ORCHESTRATOR: { status: "idle" },
    DEVELOP: { status: "idle" },
    TESTING: { status: "idle" },
  });

  // Project data
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [logs, setLogs] = useState<IAgentLog[]>([]);
  const [artifacts, setArtifacts] = useState<IArtifact[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);

  // Check initial DB and Provider status
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.database) setDbStatus(data.database);
        if (data.aiProvider?.hasEnvKey) setMode("live");
      })
      .catch((err) => console.warn("Error fetching status:", err));
  }, []);

  const handleReset = () => {
    setIsRunning(false);
    setTasks([]);
    setLogs([]);
    setArtifacts([]);
    setActiveTaskId(undefined);
    setIsCompleted(false);
    setAgentStates({
      ORCHESTRATOR: { status: "idle" },
      DEVELOP: { status: "idle" },
      TESTING: { status: "idle" },
    });
  };

  const handleRun = async (promptText: string) => {
    handleReset();
    setIsRunning(true);
    setActiveTab("console");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          mode,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const event: StreamEvent = JSON.parse(trimmed.slice(6));
              handleStreamEvent(event);
            } catch (parseErr) {
              console.error("JSON parse error:", parseErr, trimmed);
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("Run error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setLogs((prev) => [
        ...prev,
        {
          projectId: "",
          agent: "ORCHESTRATOR",
          type: "error",
          content: `Error al ejecutar: ${errMsg}`,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case "agent_status":
        if (event.agent) {
          setAgentStates((prev) => ({
            ...prev,
            [event.agent!]: {
              status: event.status || "idle",
              message: event.message,
            },
          }));
        }
        break;

      case "plan_ready":
        if (event.tasks) {
          setTasks(event.tasks);
        }
        break;

      case "task_started":
        if (event.task) {
          setActiveTaskId(event.task.id);
          setTasks((prev) =>
            prev.map((t) => (t.id === event.task!.id ? event.task! : t))
          );
        }
        break;

      case "task_status":
      case "feedback_loop":
        if (event.task) {
          setTasks((prev) =>
            prev.map((t) => (t.id === event.task!.id ? event.task! : t))
          );
        }
        break;

      case "artifact_created":
        if (event.artifact) {
          setArtifacts((prev) => {
            const next = [...prev];
            const idx = next.findIndex(
              (a) => a.fileName === event.artifact!.fileName
            );
            if (idx >= 0) {
              next[idx] = event.artifact!;
            } else {
              next.push(event.artifact!);
            }
            return next;
          });
        }
        break;

      case "log":
        if (event.log) {
          setLogs((prev) => [...prev, event.log!]);
        }
        break;

      case "project_completed":
        setIsCompleted(true);
        setActiveTaskId(undefined);
        setAgentStates({
          ORCHESTRATOR: { status: "completed", message: "Objetivo finalizado" },
          DEVELOP: { status: "completed", message: "Tareas aprobadas" },
          TESTING: { status: "completed", message: "100% Tests superados" },
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      <Header
        dbStatus={dbStatus}
        mode={mode}
        onOpenSettings={() => setShowSettings(true)}
        onOpenInfo={() => setShowInfo(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner if finished */}
        {isCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200">
                  ¡Flujo multi-agente completado con éxito!
                </h4>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  El Orquestador planificó las tareas, Develop construyó las soluciones y Testing validó el código resolviendo todos los fallos detectados.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("code")}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition"
            >
              Ver Código Generado
            </button>
          </div>
        )}

        {/* 1. AGENTS STATUS CARDS */}
        <section>
          <AgentCards agentStates={agentStates} />
        </section>

        {/* 2. PROMPT & OBJECTIVE INPUT */}
        <section>
          <PromptSection
            isRunning={isRunning}
            onRun={handleRun}
            onReset={handleReset}
          />
        </section>

        {/* 3. WORKSPACE: PIPELINE ON LEFT, CONSOLE/CODE ON RIGHT */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Task Pipeline (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <TaskPipeline tasks={tasks} activeTaskId={activeTaskId} />
          </div>

          {/* Right Column: Console / Artifact Viewer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-xl text-xs">
                <button
                  onClick={() => setActiveTab("console")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === "console"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Consola de Actividad</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500">
                    {logs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === "code"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Código & Artefactos</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500">
                    {artifacts.length}
                  </span>
                </button>
              </div>

              <span className="text-xs text-zinc-400">
                {activeTab === "console"
                  ? "Logs en streaming en tiempo real"
                  : "Ficheros creados y verificados"}
              </span>
            </div>

            {/* Tab content */}
            {activeTab === "console" ? (
              <LiveConsole logs={logs} />
            ) : (
              <ArtifactViewer artifacts={artifacts} />
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        mode={mode}
        setMode={setMode}
      />

      <ExplanationModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
}
