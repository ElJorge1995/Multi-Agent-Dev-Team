"use client";

import React, { useState } from "react";
import { X, BookOpen, HelpCircle, Code, Shield, CheckCircle, Cpu, FileText } from "lucide-react";

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExplanationModal({ isOpen, onClose }: ExplanationModalProps) {
  const [activeTab, setActiveTab] = useState<"architecture" | "questions" | "ai_usage">("architecture");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              Documentación del Proyecto & Respuestas a la Prueba
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "architecture"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Arquitectura de los 3 Agentes
          </button>
          <button
            onClick={() => setActiveTab("ai_usage")}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "ai_usage"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Uso de Claude Code / Codex
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "questions"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Las 4 Preguntas de la Entrevista
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {activeTab === "architecture" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  Equipo Autónomo de 3 Agentes
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  El sistema implementa una arquitectura multi-agente en bucle cerrado (closed-loop) donde los roles están claramente segregados:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
                  <div className="font-bold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
                    <span>1. Orquestador</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Recibe la solicitud en lenguaje natural, analiza el alcance y la descompone en tareas atómicas con criterios de aceptación explícitos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                    <span>2. Develop</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Construye la solución técnica en Next.js 16, TypeScript y Tailwind. Genera artefactos de código y atiende las órdenes de corrección de Testing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                    <span>3. Testing</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Valida los criterios de aceptación, detecta fallos en casos límite y devuelve feedback correctivo a Develop hasta alcanzar el 100% de aprobación.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  🔄 El Bucle de Feedback (Feedback Loop)
                </h4>
                <p className="mb-2">
                  Tal como solicitaban los requisitos (<em>«Testing comprueba lo que ha hecho Develop y devuelve lo que falla, hasta que todo pasa»</em>):
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
                  <li>Develop genera la primera versión de un componente o endpoint.</li>
                  <li>Testing ejecuta casos de prueba (ej: validación de inputs, estados de carga, prevención de doble click).</li>
                  <li>Al detectar un fallo, Testing marca la tarea en <span className="font-semibold text-amber-600">RETRYING</span> y le envía a Develop el stack trace y la sugerencia de corrección.</li>
                  <li>Develop lee el feedback, parchea el fichero y genera una versión v2.0.</li>
                  <li>Testing re-evalúa y, al comprobar que los fallos fueron resueltos, aprueba la tarea (<span className="font-semibold text-emerald-600">PASSED</span>) para avanzar a la siguiente.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "ai_usage" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  Cómo se utilizó la IA para construir esta aplicación
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Explicación para los entrevistadores sobre el uso de herramientas de programación con agentes:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                  <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    1. Scaffolding y Modelado Relacional
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Se utilizó el asistente en terminal para estructurar el esquema relacional en Prisma (<code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Project</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Task</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">AgentLog</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Artifact</code>) asegurando compatibilidad con bases de datos PostgreSQL serverless como Neon o Supabase.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                  <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    2. Orquestación del Flujo Multi-Agente
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Se diseñaron los prompts de sistema y esquemas de validación tipados con Zod para forzar salidas JSON deterministas de cada agente, implementando la máquina de estados que gestiona la comunicación entre Orquestador, Develop y Testing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                  <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    3. Streaming en Tiempo Real (SSE)
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Se implementó el canal de Server-Sent Events en <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">/api/run</code> para emitir en directo cada pensamiento, cambio de estado de tarea y fichero generado a la interfaz sin necesidad de recargar la página.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  Respuestas a las 4 Preguntas de la Entrevista
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Basadas en experiencia real en proyectos de producción (EFL Fight League y Plataforma Multi-Red Social):
                </p>
              </div>

              {/* Pregunta 1 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  1. ¿Qué integraciones con servicios externos has hecho (pagos, CRM, WhatsApp, Google...)? Cuéntanos una que te costara y cómo la resolviste.
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  He trabajado con una amplia variedad de integraciones en proyectos reales en producción:
                  <br />
                  • <strong>Pagos y logística (en EFL - Elite Fight League):</strong> Integración de Stripe (PaymentIntent embebido, checkout y webhooks asíncronos con firma criptográfica e idempotencia) y la API de Packlink PRO para cálculo de envíos en tiempo real y generación de borradores de etiquetas vía Vercel Crons.
                  <br />
                  • <strong>Redes Sociales y OAuth (en BotRedesSociales):</strong> Meta Graph API (Facebook e Instagram Login directo con tokens de 60 días), TikTok Content Posting API, YouTube Data API v3 (Google Cloud), Twitter/X API (Pay-Per-Use) y automatizaciones conectadas con n8n.
                  <br />
                  • <strong>Bases de Datos y Email:</strong> Supabase (Postgres, Auth y Storage con RLS) y nodemailer SMTP para envíos transaccionales.
                  <br /><br />
                  <strong>La que más me costó:</strong> La <strong>API de TikTok (Content Posting API - Direct Post)</strong>. Requirió superar **3 rechazos de auditoría** antes de conseguir la aprobación para publicar en producción:
                  <br />
                  1. <em>Rechazo por modelo de negocio:</em> TikTok rechaza apps de uso interno/personal; tuve que reestructurar la plataforma para certificarla como multi-cliente (los clientes conectan sus propias cuentas vía OAuth).
                  <br />
                  2. <em>Rechazo por coherencia de marca:</em> Exigieron coherencia total (nombre de app = título de pestaña = dominio verificado = favicon) y páginas públicas de Términos y Privacidad sin requerir login.
                  <br />
                  3. <em>Vídeo demo y Direct Post:</em> Exigían un vídeo demostrativo continuo con la barra de navegación visible mostrando la publicación efectiva en TikTok. Además, la auditoría de <em>Direct Post</em> requería verificación de dominio previa para <code>PULL_FROM_URL</code> en fotos y carga binaria <code>FILE_UPLOAD</code> para vídeos.
                  <br /><br />
                  Resolví cada requerimiento punto por punto hasta lograr la certificación completa en vivo.
                </p>
              </div>

              {/* Pregunta 2 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  2. ¿Has publicado apps en App Store o Google Play? ¿Cuáles y qué parte hiciste tú?
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  Mi trayectoria principal está enfocada en el desarrollo <strong>Full-Stack Web (Next.js, Laravel, Supabase, PostgreSQL) y aplicaciones web progresivas (PWAs)</strong> responsivas de alto rendimiento optimizadas para dispositivos móviles.
                  <br /><br />
                  Aunque no he publicado apps móviles nativas individuales directamente en App Store o Google Play, domino con solvencia los estándares de seguridad, privacidad y verificación de permisos que exigen las grandes plataformas (como demuestran las auditorías aprobadas en Meta App Review y TikTok Direct Post, cuyos criterios de revisión, gestión de scopes OAuth y políticas de datos son idénticos a los de Google Play Console y App Store Connect). Además, cuento con base en React y TypeScript que me permite adaptarme de inmediato a React Native o Expo cuando el proyecto lo requiere.
                </p>
              </div>

              {/* Pregunta 3 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  3. ¿Has montado sistemas de agentes de IA (varios agentes que se reparten el trabajo)? ¿Con qué herramientas y para qué?
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  Sí. He desarrollado sistemas multi-agente utilizando <strong>Vercel AI SDK</strong>, modelos LLM con validación estructurada (Zod / <em>Structured Outputs</em>) y orquestación visual en <strong>n8n</strong>:
                  <br /><br />
                  1. <strong>Equipo Autónomo de Desarrollo (este proyecto):</strong> Una tríada colaborativa en bucle cerrado (closed-loop) donde el <em>Orquestador</em> analiza y desglosa requerimientos, <em>Develop</em> programa los ficheros técnicos y <em>Testing</em> ejecuta pruebas automáticas, devolviendo feedback de corrección a Develop hasta que el código queda 100% aprobado.
                  <br />
                  2. <strong>Workflows Multi-Agente en n8n:</strong> Nodos y agentes especializados que ingieren contenidos de múltiples fuentes, sintetizan y adaptan el tono de redacción para cada red social con LLMs, y coordinan la publicación automatizada mediante APIs REST.
                </p>
              </div>

              {/* Pregunta 4 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  4. Un cliente te pide algo que no entra en lo contratado. ¿Cómo se lo dices?
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  Abordo la situación con <strong>asertividad, empatía y enfoque comercial constructivo</strong>, sin decir un «no» cortante ni aceptar desviaciones que pongan en riesgo el proyecto.
                  <br /><br />
                  <strong>Estructura en 3 pasos:</strong>
                  <br />
                  1. <em>Validar positivamente la idea:</em> «Me parece una funcionalidad fantástica y entiendo perfectamente el valor que aporta a tu negocio.»
                  <br />
                  2. <em>Alinear con el alcance acordado:</em> «Al revisar la planificación y el contrato actual, esta funcionalidad queda fuera del alcance definido para esta entrega.»
                  <br />
                  3. <em>Ofrecer dos alternativas viables:</em>
                  <br />
                  - <strong>Opción A (Fase 2 / Addendum):</strong> «Podemos estimar el esfuerzo de esta nueva función y presupuestarla como una mejora o fase 2 justo al terminar la entrega actual, evitando retrasar el lanzamiento.»
                  <br />
                  - <strong>Opción B (Sustitución de alcance):</strong> «O bien, si esta nueva función es prioritaria para el lanzamiento, podemos sustituir alguna de las tareas previstas de esfuerzo similar para mantener intactos tanto el presupuesto como la fecha de entrega.»
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Prueba Técnica Multi-Agente · Next.js & AI Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
