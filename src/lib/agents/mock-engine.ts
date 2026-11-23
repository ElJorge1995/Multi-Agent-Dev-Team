import {
  ITask,
  IAgentLog,
  IArtifact,
  TestResultReport,
  StreamEvent,
} from "@/types";
import {
  createProject,
  saveTasks,
  updateTaskStatus,
  updateProjectStatus,
  saveLog,
  saveArtifact,
} from "@/lib/db";

// Helper for delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runMockWorkflow(
  prompt: string,
  onEvent: (event: StreamEvent) => void
) {
  // 1. Initial creation
  const isContact =
    prompt.toLowerCase().includes("contacto") ||
    prompt.toLowerCase().includes("contact");
  const isAuth =
    prompt.toLowerCase().includes("auth") ||
    prompt.toLowerCase().includes("login") ||
    prompt.toLowerCase().includes("usuario");
  const isShop =
    prompt.toLowerCase().includes("carrito") ||
    prompt.toLowerCase().includes("tienda") ||
    prompt.toLowerCase().includes("pago");

  const title = isContact
    ? "Página de Contacto y Feedback"
    : isAuth
    ? "Módulo de Autenticación y Registro"
    : isShop
    ? "Sistema de Carrito y Checkout"
    : `Módulo: ${prompt.slice(0, 32)}`;

  const project = await createProject(prompt, title);
  onEvent({ type: "project_created", project });

  // -------------------------------------------------------------
  // FASE 1: ORQUESTADOR
  // -------------------------------------------------------------
  onEvent({
    type: "agent_status",
    agent: "ORCHESTRATOR",
    status: "thinking",
    message: "Analizando la solicitud y planificando la arquitectura...",
  });

  const orchestratorLog1: IAgentLog = await saveLog(project.id, {
    projectId: project.id,
    agent: "ORCHESTRATOR",
    type: "thought",
    content: `He recibido la solicitud: "${prompt}". Voy a desglosar este requerimiento en 3 tareas técnicas secuenciales para Develop y Testing.`,
  });
  onEvent({ type: "log", log: orchestratorLog1 });
  await delay(1200);

  // Define tasks based on prompt
  const taskTemplates: Array<{
    title: string;
    description: string;
    testCriteria: string[];
  }> = isContact
    ? [
        {
          title: "Crear esquema de validación y Endpoint API de Contacto",
          description:
            "Definir esquema con Zod (nombre, email, asunto, mensaje) y ruta POST /api/contact con rate-limiting y manejo de errores.",
          testCriteria: [
            "Rechaza emails con formato inválido (400 Bad Request)",
            "Valida que el mensaje tenga al menos 10 caracteres",
            "Maneja payloads malformados de forma segura",
          ],
        },
        {
          title: "Diseñar Componente UI del Formulario de Contacto",
          description:
            "Crear formulario en Next.js Client Component con feedback de carga, estados accesible y notificaciones de éxito/error.",
          testCriteria: [
            "Desactiva el botón de envío durante el submit para evitar envíos duplicados",
            "Muestra mensajes de error en línea debajo de cada campo",
            "Cuenta con atributos aria-required y accesibilidad para lectores de pantalla",
          ],
        },
        {
          title: "Implementar Página /contacto con SEO y Metadata",
          description:
            "Crear la página Next.js App Router en src/app/contacto/page.tsx integrando el formulario y metadatos SEO.",
          testCriteria: [
            "Exporta metadata con title y description para SEO",
            "Renderiza correctamente en modo responsive móvil y escritorio",
          ],
        },
      ]
    : isAuth
    ? [
        {
          title: "Definir Modelo de Datos y Servicio de Autenticación",
          description:
            "Configurar endpoints de login/registro con hash de contraseña y validación de tokens de sesión.",
          testCriteria: [
            "Valida fortaleza de contraseña (mínimo 8 caracteres, números y símbolos)",
            "Protege contra enumeración de usuarios en respuestas de error",
          ],
        },
        {
          title: "Crear Pantallas de Login y Registro con Estado Global",
          description:
            "Componentes de interfaz con tabs interactivos, validaciones reactivas y redirección automática.",
          testCriteria: [
            "Maneja estados de error de credenciales incorrectas",
            "Desactiva inputs mientras la petición HTTP está en curso",
          ],
        },
      ]
    : [
        {
          title: `Definir estructura y lógica base para: ${prompt.slice(0, 25)}`,
          description:
            "Estructurar los tipos TypeScript, controladores y capa de datos necesaria.",
          testCriteria: [
            "Tipado estricto sin tipos any",
            "Manejo de excepciones controlado en todas las funciones",
          ],
        },
        {
          title: `Construir Interfaz de Usuario y Flujo de Interacción`,
          description:
            "Crear componentes visuales en Tailwind CSS con estados interactivos y feedback visual.",
          testCriteria: [
            "Responde fluidamente a interacciones de usuario",
            "Muestra estados vacíos y de carga correctamente",
          ],
        },
      ];

  const tasksToSave: ITask[] = taskTemplates.map((t, idx) => ({
    id: `task_${Date.now()}_${idx}`,
    projectId: project.id,
    title: t.title,
    description: t.description,
    order: idx + 1,
    assignedTo: "DEVELOP",
    status: "PENDING",
    iterations: 0,
    testCriteria: t.testCriteria,
  }));

  const savedTasks = await saveTasks(project.id, tasksToSave);
  onEvent({ type: "plan_ready", tasks: savedTasks });

  const orchestratorLog2: IAgentLog = await saveLog(project.id, {
    projectId: project.id,
    agent: "ORCHESTRATOR",
    type: "action",
    content: `Plan completado. He creado ${savedTasks.length} tareas estructuradas. Asigno la Tarea #1 al Agente Develop y preparo a Testing para la verificación.`,
  });
  onEvent({ type: "log", log: orchestratorLog2 });
  onEvent({ type: "agent_status", agent: "ORCHESTRATOR", status: "completed" });
  await delay(1000);

  // -------------------------------------------------------------
  // FASE 2: BUCLE DEVELOP <-> TESTING PARA CADA TAREA
  // -------------------------------------------------------------
  for (let i = 0; i < savedTasks.length; i++) {
    const task = savedTasks[i];
    await updateProjectStatus(project.id, "in_progress");

    // Marcar tarea en progreso
    await updateTaskStatus(task.id, project.id, "IN_PROGRESS", 0);
    task.status = "IN_PROGRESS";
    onEvent({ type: "task_started", task });

    // DEVELOPER TRABAJA
    onEvent({
      type: "agent_status",
      agent: "DEVELOP",
      status: "active",
      message: `Desarrollando tarea ${i + 1}/${savedTasks.length}: ${task.title}...`,
    });

    const devLog1: IAgentLog = await saveLog(project.id, {
      projectId: project.id,
      agent: "DEVELOP",
      type: "thought",
      content: `Recibida tarea "${task.title}". Analizo los requerimientos y comienzo a codificar la solución con Next.js y TypeScript.`,
    });
    onEvent({ type: "log", log: devLog1 });
    await delay(1400);

    // Código inicial generado por Develop (con un pequeño fallo a propósito en la tarea 2 o 1 para probar el bucle de feedback)
    const isFirstComplexTask = i === 0 || (isContact && i === 1);
    const initialCode = getMockCodeForTask(task.title, i, 1);

    const artifact1 = await saveArtifact(project.id, task.id, {
      fileName: initialCode.fileName,
      content: initialCode.content,
      language: "typescript",
      version: 1,
    });
    onEvent({ type: "artifact_created", artifact: artifact1, task });

    const devLog2: IAgentLog = await saveLog(project.id, {
      projectId: project.id,
      agent: "DEVELOP",
      type: "action",
      content: `He implementado la primera versión en el archivo \`${initialCode.fileName}\`. Transfiero el control al Agente Testing para su verificación.`,
    });
    onEvent({ type: "log", log: devLog2 });
    onEvent({ type: "agent_status", agent: "DEVELOP", status: "idle" });
    await delay(1200);

    // TESTING VERIFICA
    await updateTaskStatus(task.id, project.id, "TESTING", 1);
    task.status = "TESTING";
    task.iterations = 1;
    onEvent({ type: "task_status", task });

    onEvent({
      type: "agent_status",
      agent: "TESTING",
      status: "reviewing",
      message: `Ejecutando suite de pruebas sobre \`${initialCode.fileName}\`...`,
    });

    const testLog1: IAgentLog = await saveLog(project.id, {
      projectId: project.id,
      agent: "TESTING",
      type: "thought",
      content: `Revisando código de Develop contra los criterios de aceptación: [${task.testCriteria?.join(", ")}]. Ejecutando pruebas automáticas de regresión y casos borde.`,
    });
    onEvent({ type: "log", log: testLog1 });
    await delay(1500);

    // Simulamos que la primera tarea o la tarea UI falla en la iteración 1 para demostrar el bucle iterativo solicitado en la prueba
    if (isFirstComplexTask) {
      const defectSummary = isContact
        ? "Fallo en Caso Límite: El botón de envío no queda desactivado durante el estado de carga (`isSubmitting`), permitiendo enviar formularios duplicados si el usuario pulsa repetidamente. Además falta validación regex estricta de dominios de email."
        : "Fallo en Validación: Falta control de sanitización de caracteres especiales y manejo de timeout en la petición de red.";

      const failureReport: TestResultReport = {
        passed: false,
        totalTests: 4,
        passedTests: 3,
        failedTests: 1,
        failures: [
          {
            testName: "Submit Button Disabled During In-Flight Request",
            file: initialCode.fileName,
            line: 42,
            errorMessage:
              "Expected button to have 'disabled' attribute when status === 'loading'",
            suggestion:
              "Añade `disabled={isSubmitting}` y añade un spinner o texto 'Enviando...' para evitar peticiones concurrentes.",
          },
        ],
        summary: defectSummary,
        coverage: "82%",
      };

      const testLogFail: IAgentLog = await saveLog(project.id, {
        projectId: project.id,
        agent: "TESTING",
        type: "feedback",
        content: `🚨 **TESTS FALLIDOS (3/4 pasadas, 1 fallo detectado)**:\n${defectSummary}\n\nDevolviendo la tarea a Develop con el reporte de error para corrección.`,
        meta: failureReport as unknown as Record<string, unknown>,
      });
      onEvent({ type: "log", log: testLogFail });
      onEvent({ type: "test_completed", testReport: failureReport, task });

      // Actualizar estado a RETRYING / FEEDBACK LOOP
      await updateTaskStatus(task.id, project.id, "RETRYING", 1);
      task.status = "RETRYING";
      onEvent({
        type: "feedback_loop",
        task,
        message: "Testing detectó un fallo. Develop recibe el feedback para corregirlo.",
      });
      onEvent({ type: "agent_status", agent: "TESTING", status: "error" });
      await delay(1600);

      // DEVELOP CORRIGE
      onEvent({
        type: "agent_status",
        agent: "DEVELOP",
        status: "retrying",
        message: "Analizando fallo reportado por Testing y refactorizando código...",
      });

      const devLogFix: IAgentLog = await saveLog(project.id, {
        projectId: project.id,
        agent: "DEVELOP",
        type: "thought",
        content: `Entendido el fallo reportado por Testing: "${failureReport.failures[0].suggestion}". Procedo a aplicar el atributo disabled, spinner accesible y validación reforzada en \`${initialCode.fileName}\`.`,
      });
      onEvent({ type: "log", log: devLogFix });
      await delay(1800);

      const fixedCode = getMockCodeForTask(task.title, i, 2);
      const artifactFixed = await saveArtifact(project.id, task.id, {
        fileName: fixedCode.fileName,
        content: fixedCode.content,
        language: "typescript",
        version: 2,
      });
      onEvent({ type: "artifact_created", artifact: artifactFixed, task });

      const devLogFixed: IAgentLog = await saveLog(project.id, {
        projectId: project.id,
        agent: "DEVELOP",
        type: "action",
        content: `✅ Corrección aplicada con éxito en \`${fixedCode.fileName}\`. Generada versión 2.0. Solicitando re-evaluación al Agente Testing.`,
      });
      onEvent({ type: "log", log: devLogFixed });
      onEvent({ type: "agent_status", agent: "DEVELOP", status: "idle" });
      await delay(1300);

      // TESTING RE-EVALÚA Y APRUEBA
      onEvent({
        type: "agent_status",
        agent: "TESTING",
        status: "reviewing",
        message: "Re-ejecutando tests de regresión sobre la versión corregida...",
      });
      await delay(1400);
    }

    // APROBACIÓN DE TESTING
    const successReport: TestResultReport = {
      passed: true,
      totalTests: 4,
      passedTests: 4,
      failedTests: 0,
      failures: [],
      summary: `Todos los criterios de aceptación verificados. Código robusto, tipado seguro y tests 100% superados en iteración ${
        isFirstComplexTask ? 2 : 1
      }.`,
      coverage: "98%",
    };

    const testLogPass: IAgentLog = await saveLog(project.id, {
      projectId: project.id,
      agent: "TESTING",
      type: "test_result",
      content: `🎉 **TESTS SUPERADOS (4/4 passed)**: El código cumple todos los requisitos funcionales, accesibilidad y casos límite. Aprobado para producción.`,
      meta: successReport as unknown as Record<string, unknown>,
    });
    onEvent({ type: "log", log: testLogPass });
    onEvent({ type: "test_completed", testReport: successReport, task });
    onEvent({ type: "agent_status", agent: "TESTING", status: "completed" });

    await updateTaskStatus(task.id, project.id, "PASSED", isFirstComplexTask ? 2 : 1);
    task.status = "PASSED";
    task.iterations = isFirstComplexTask ? 2 : 1;
    onEvent({ type: "task_status", task });
    await delay(1000);
  }

  // -------------------------------------------------------------
  // FASE 3: CIERRE DEL PROYECTO
  // -------------------------------------------------------------
  await updateProjectStatus(project.id, "completed");
  project.status = "completed";

  onEvent({
    type: "agent_status",
    agent: "ORCHESTRATOR",
    status: "completed",
    message: "Todas las tareas han sido completadas y verificadas por Testing.",
  });

  const finalLog: IAgentLog = await saveLog(project.id, {
    projectId: project.id,
    agent: "ORCHESTRATOR",
    type: "action",
    content: `🏁 **PROYECTO COMPLETADO CON ÉXITO**: Todas las tareas (${savedTasks.length}/${savedTasks.length}) han sido desarrolladas por Develop y verificadas al 100% por Testing. Los artefactos están listos para ser inspeccionados.`,
  });
  onEvent({ type: "log", log: finalLog });
  onEvent({ type: "project_completed", project });
}

// Generador de código realista para los artefactos
function getMockCodeForTask(
  title: string,
  taskIndex: number,
  iteration: number
): { fileName: string; content: string } {
  if (taskIndex === 0) {
    return {
      fileName: "src/app/api/contact/route.ts",
      content: `import { NextResponse } from "next/server";
import { z } from "zod";

// Schema de validación Zod
const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  subject: z.string().min(4, "El asunto debe tener al menos 4 caracteres"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // Simulación de envío a servicio de email / CRM
    console.log("Mensaje de contacto recibido:", validatedData);

    return NextResponse.json({
      success: true,
      message: "Tu mensaje ha sido recibido. Te responderemos en breve.",
      data: { name: validatedData.name, email: validatedData.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}`,
    };
  }

  if (taskIndex === 1) {
    if (iteration === 1) {
      // Versión con el fallo sutil (sin botón disabled y sin spinner)
      return {
        fileName: "src/components/ContactForm.tsx",
        content: `"use client";

import React, { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // Petición POST
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } else {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg bg-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg bg-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mensaje</label>
        <textarea
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg bg-transparent"
        />
      </div>
      {/* Fallo detectado por testing: Falta disabled={status === "loading"} */}
      <button
        type="submit"
        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Enviar Mensaje
      </button>
    </form>
  );
}`,
      };
    } else {
      // Versión corregida tras el feedback de Testing
      return {
        fileName: "src/components/ContactForm.tsx",
        content: `"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const isSubmitting = status === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Protección extra contra doble clic
    
    setStatus("loading");
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setFeedbackMsg("¡Mensaje enviado con éxito! Te contactaremos pronto.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setFeedbackMsg(data.error || "Ocurrió un error al procesar tu solicitud.");
      }
    } catch {
      setStatus("error");
      setFeedbackMsg("Error de red. Por favor, inténtalo más tarde.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Formulario de contacto"
      className="space-y-4 max-w-lg mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 transition-all"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          disabled={isSubmitting}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Juan Pérez"
          className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
          Correo electrónico <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          disabled={isSubmitting}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="tu@email.com"
          className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          required
          minLength={10}
          disabled={isSubmitting}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Cuéntanos en qué podemos ayudarte..."
          className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
        />
      </div>

      {feedbackMsg && (
        <div
          role="alert"
          className={\`p-3 rounded-lg text-sm flex items-center gap-2 \${
            status === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
          }\`}
        >
          {status === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ✅ CORRECCIÓN DE TESTING: Botón disabled con spinner e indicador accesible */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enviando mensaje...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Enviar Mensaje</span>
          </>
        )}
      </button>
    </form>
  );
}`,
      };
    }
  }

  // Tarea 3 o fallback
  return {
    fileName: "src/app/contacto/page.tsx",
    content: `import { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto | Nuestro Equipo",
  description: "Ponte en contacto con nuestro equipo de atención y soporte.",
};

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Contáctanos
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          ¿Tienes alguna duda o proyecto en mente? Escríbenos y te responderemos a la brevedad.
        </p>
      </div>

      <ContactForm />
    </main>
  );
}`,
  };
}
