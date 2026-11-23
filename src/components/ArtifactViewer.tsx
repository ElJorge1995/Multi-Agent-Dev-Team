"use client";

import React, { useState } from "react";
import { IArtifact } from "@/types";
import { FileCode2, Copy, Check, Sparkles } from "lucide-react";

interface ArtifactViewerProps {
  artifacts: IArtifact[];
}

export function ArtifactViewer({ artifacts }: ArtifactViewerProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (artifacts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
        <FileCode2 className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Ningún archivo generado todavía
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          A medida que el Agente Develop complete tareas, aquí verás el código fuente en tiempo real.
        </p>
      </div>
    );
  }

  // Deduplicate artifacts by filename, keeping the latest version
  const fileMap = new Map<string, IArtifact>();
  artifacts.forEach((art) => {
    fileMap.set(art.fileName, art);
  });
  const uniqueFiles = Array.from(fileMap.values());
  const activeFile = uniqueFiles[selectedFileIdx] || uniqueFiles[0];

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0d1117] overflow-hidden flex flex-col h-[520px] shadow-lg">
      {/* File tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-zinc-800 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {uniqueFiles.map((file, idx) => (
            <button
              key={file.fileName}
              onClick={() => setSelectedFileIdx(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition whitespace-nowrap ${
                selectedFileIdx === idx
                  ? "bg-[#1f242c] text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{file.fileName.split("/").pop()}</span>
              {file.version && file.version > 1 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30">
                  v{file.version} (Corregido)
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 transition"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar código</span>
            </>
          )}
        </button>
      </div>

      {/* File metadata banner */}
      <div className="px-4 py-2 bg-[#13171e] border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <span className="truncate max-w-md">{activeFile.fileName}</span>
        <div className="flex items-center gap-2">
          {activeFile.version && activeFile.version > 1 ? (
            <span className="flex items-center gap-1 text-amber-400 text-[11px]">
              <Sparkles className="w-3 h-3" />
              Versión corregida tras reporte de Testing
            </span>
          ) : (
            <span className="text-zinc-500 text-[11px]">Versión 1.0</span>
          )}
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-zinc-200 leading-relaxed bg-[#0d1117]">
        <pre className="overflow-x-auto whitespace-pre font-mono">
          <code>{activeFile.content}</code>
        </pre>
      </div>
    </div>
  );
}
