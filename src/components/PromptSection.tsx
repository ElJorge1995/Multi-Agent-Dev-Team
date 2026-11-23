"use client";

import React, { useState } from "react";
import { Send, Loader2, PlayCircle, RefreshCw } from "lucide-react";

interface PromptSectionProps {
  isRunning: boolean;
  onRun: (prompt: string) => void;
  onReset: () => void;
}

export function PromptSection({ isRunning, onRun, onReset }: PromptSectionProps) {
  const [prompt, setPrompt] = useState("");

  const presets = [
    {
      label: "📌 Página de Contacto (Ejemplo de la prueba)",
      prompt: "Añade una página de contacto a esta web con formulario, validación de campos y endpoint API seguro",
    },
    {
      label: "🔐 Sistema de Autenticación",
      prompt: "Implementa un flujo de login y registro de usuarios con validación de contraseña segura y manejo de tokens",
    },
    {
      label: "🛒 Carrito de Compras",
      prompt: "Crea un componente de carrito de compras con persistencia local, cálculo de IVA y resumen de checkout",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;
    onRun(prompt.trim());
  };

  const handleSelectPreset = (presetPrompt: string) => {
    if (isRunning) return;
    setPrompt(presetPrompt);
    onRun(presetPrompt);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor="prompt-input"
          className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
        >
          <span>🎯 Objetivo para el Equipo de Agentes</span>
          <span className="text-xs text-zinc-400 font-normal">
            (El Orquestador lo descompondrá y repartirá a Develop y Testing)
          </span>
        </label>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Agentes trabajando en tiempo real...
          </span>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-inner p-3 flex flex-col justify-between min-h-[110px]">
          <textarea
            id="prompt-input"
            rows={2}
            value={prompt}
            disabled={isRunning}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ejemplo: «añade una página de contacto a esta web con validación y notificaciones»..."
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition text-sm disabled:opacity-60 resize-y min-h-[50px] leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-1">
            <span className="text-[11px] text-zinc-400">
              Pulsa <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">Enter ↵</kbd> para enviar
            </span>
            <button
              type="submit"
              disabled={!prompt.trim() || isRunning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>En curso...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ejecutar Agentes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-zinc-400 mr-1 flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5" /> Pruebas rápidas:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isRunning}
              onClick={() => handleSelectPreset(preset.prompt)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 transition disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
          {isRunning && (
            <button
              type="button"
              onClick={onReset}
              className="ml-auto text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reiniciar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
