"use client";

import React from "react";
import { Bot, Sparkles, Database, Settings, HelpCircle } from "lucide-react";

interface HeaderProps {
  dbStatus: { connected: boolean; provider: string };
  mode: "mock" | "live";
  onOpenSettings: () => void;
  onOpenInfo: () => void;
}

export function Header({ dbStatus, mode, onOpenSettings, onOpenInfo }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight text-lg">
                Multi-Agent Dev Team
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Next.js 15
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Orquestador + Develop + Testing en ciclo continuo
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-3">
          {/* DB Indicator */}
          <div
            title={`Base de datos: ${dbStatus.provider}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate max-w-[130px]">
              {dbStatus.connected ? "Neon / Supabase" : "DB Storage"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus.connected ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
          </div>

          {/* Mode Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>{mode === "live" ? "Modo LLM" : "Modo Autónomo"}</span>
          </div>

          {/* Info Button */}
          <button
            onClick={onOpenInfo}
            aria-label="Ver arquitectura del proyecto"
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Configuración"
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
