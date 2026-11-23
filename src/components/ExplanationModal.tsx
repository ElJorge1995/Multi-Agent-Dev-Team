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
                    Construye la solución técnica en Next.js 15, TypeScript y Tailwind. Genera artefactos de código y atiende las órdenes de corrección de Testing.
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
                  <li>Testing ejecuta casos de prueba (ej: validación de campos, doble submit en botones, control de errores).</li>
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
                    1. Arquitectura & Modelado de Datos
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Se utilizó el asistente en terminal para estructurar el esquema relacional en Prisma (<code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Project</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Task</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">AgentLog</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Artifact</code>) asegurando compatibilidad con bases de datos serverless como Neon o Supabase.
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
                  Estas son las respuestas preparadas para entregar en el formulario de la candidatura:
                </p>
              </div>

              {/* Pregunta 1 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  1. ¿Qué integraciones con servicios externos has hecho (pagos, CRM, WhatsApp, Google...)? Cuéntanos una que te costara y cómo la resolviste.
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  He integrado pasarelas de pago (Stripe Checkout y suscripciones recurrentes), autenticación federada con Google OAuth2, APIs de mensajería (WhatsApp Cloud API / Twilio) y sincronización con CRMs como HubSpot.
                  <br /><br />
                  <strong>El reto más complejo:</strong> La gestión de <em>webhooks asíncronos en Stripe</em> bajo concurrencia y caídas de red. El desafío principal era evitar el doble cobro o doble activación de cuentas ante reintentos automáticos de Stripe (at-least-once delivery).
                  <br /><br />
                  <strong>Cómo lo resolví:</strong> Implementé un patrón de <strong>idempotencia estricta</strong> en la base de datos guardando el <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">event.id</code> dentro de una transacción con clave única. Si el evento ya figuraba como procesado, devolvía <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">200 OK</code> inmediatamente. Además, validé la firma criptográfica del header (<code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">stripe-signature</code>) usando el buffer crudo del request para prevenir ataques de replay.
                </p>
              </div>

              {/* Pregunta 2 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  2. ¿Has publicado apps en App Store o Google Play? ¿Cuáles y qué parte hiciste tú?
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  Sí, he trabajado en el ciclo completo de desarrollo y despliegue móvil utilizando <strong>React Native y Expo (EAS Build / Submit)</strong>.
                  <br /><br />
                  <strong>Mi rol y responsabilidades:</strong>
                  Me encargué de la arquitectura frontend, la integración con las APIs REST/GraphQL del backend, el almacenamiento seguro local (SecureStore para tokens JWT), y la configuración de notificaciones push (Expo Push Notifications / FCM). En el proceso de publicación, gestioné los certificados y perfiles de aprovisionamiento en Apple Developer Center, la consola de Google Play Console (subida de AABs, configuración de fichas de la tienda y resolución de requerimientos de privacidad de datos y permisos del manifiesto).
                </p>
              </div>

              {/* Pregunta 3 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  3. ¿Has montado sistemas de agentes de IA (varios agentes que se reparten el trabajo)? ¿Con qué herramientas y para qué?
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  Sí. He diseñado e implementado arquitecturas multi-agente tanto con <strong>Vercel AI SDK</strong> como con flujos de agentes autónomos basados en llamadas estructuradas (<code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">generateObject</code> / Function Calling) con modelos de OpenAI y Google Gemini.
                  <br /><br />
                  <strong>Casos de uso y herramientas:</strong>
                  <br />
                  1. <em>Equipo de Desarrollo Autónomo (esta misma aplicación):</em> Un Orquestador que planifica y desglosa tareas, un Desarrollador que escribe el código y un Tester que ejecuta validaciones con un bucle de reintento automático hasta que el código es 100% aprobado.
                  <br />
                  2. <em>Pipeline de análisis y redacción técnica:</em> Un agente investigador que sintetiza fuentes documentales, un agente redactor que genera el contenido técnico y un agente crítico/corrector que valida la exactitud y tono antes de publicar.
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
                  <strong>Estructura de la respuesta que aplico:</strong>
                  <br />
                  1. <em>Validar la idea:</em> «Me parece una funcionalidad fantástica y entiendo perfectamente el valor que aporta a tu negocio.»
                  <br />
                  2. <em>Alinear con el alcance acordado:</em> «Al revisar la hoja de ruta y el contrato actual, esta funcionalidad queda fuera del alcance definido para esta entrega.»
                  <br />
                  3. <em>Ofrecer dos alternativas viables:</em>
                  <br />
                  - <strong>Opción A (Fase 2 / Addendum):</strong> «Podemos estimar el esfuerzo de esta nueva función y presupuestarla como una mejora o fase 2 justo al terminar la entrega actual.»
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
