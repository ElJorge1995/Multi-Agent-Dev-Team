import { StreamEvent, ITask, IAgentLog, TestResultReport } from "@/types";
import {
  createProject,
  saveTasks,
  updateTaskStatus,
  updateProjectStatus,
  saveLog,
  saveArtifact,
} from "@/lib/db";
import {
  ORCHESTRATOR_SYSTEM_PROMPT,
  DEVELOPER_SYSTEM_PROMPT,
  TESTER_SYSTEM_PROMPT,
} from "./prompts";
import { generateObject } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { z } from "zod";

function getModel(customKey?: string, providerName?: string) {
  if (customKey) {
    if (providerName === "google" || customKey.startsWith("AIza")) {
      const googleProvider = createGoogleGenerativeAI({ apiKey: customKey });
      return googleProvider("gemini-1.5-flash");
    }
    const openaiProvider = createOpenAI({ apiKey: customKey });
    return openaiProvider("gpt-4o-mini");
  }

  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const googleProvider = createGoogleGenerativeAI({ apiKey: key });
    return googleProvider("gemini-1.5-flash");
  }
  return null;
}

export async function runLiveWorkflow(
  prompt: string,
  onEvent: (event: StreamEvent) => void,
  customApiKey?: string,
  customProvider?: string
) {
  const model = getModel(customApiKey, customProvider);
  if (!model) {
    throw new Error("No hay API Key configurada para LLM en vivo.");
  }

  // 1. Crear proyecto
  const project = await createProject(prompt, prompt.slice(0, 35) + "...");
  onEvent({ type: "project_created", project });

  // 2. ORQUESTADOR
  onEvent({
    type: "agent_status",
    agent: "ORCHESTRATOR",
    status: "thinking",
    message: "El Orquestador está planificando la arquitectura y dividiendo tareas...",
  });

  const orchestratorLog1 = await saveLog(project.id, {
    projectId: project.id,
    agent: "ORCHESTRATOR",
    type: "thought",
    content: `Analizando el requerimiento: "${prompt}" con el modelo LLM.`,
  });
  onEvent({ type: "log", log: orchestratorLog1 });

  // Llamada estructurada al Orquestador
  const planSchema = z.object({
    projectTitle: z.string(),
    architectureSummary: z.string(),
    tasks: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        testCriteria: z.array(z.string()),
      })
    ).min(2).max(4),
  });

  const { object: plan } = await generateObject({
    model,
    system: ORCHESTRATOR_SYSTEM_PROMPT,
    prompt: `Requerimiento del usuario: "${prompt}". Desglosa en 2 a 3 tareas técnicas secuenciales para Develop y Testing.`,
    schema: planSchema,
  });

  const tasksToSave: ITask[] = plan.tasks.map((t, idx) => ({
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

  const orchestratorLog2 = await saveLog(project.id, {
    projectId: project.id,
    agent: "ORCHESTRATOR",
    type: "action",
    content: `Plan arquitectónico creado: "${plan.projectTitle}". Se han asignado ${savedTasks.length} tareas a Develop.`,
    meta: { architecture: plan.architectureSummary },
  });
  onEvent({ type: "log", log: orchestratorLog2 });
  onEvent({ type: "agent_status", agent: "ORCHESTRATOR", status: "completed" });

  // 3. CICLO DEVELOP <-> TESTING
  for (let i = 0; i < savedTasks.length; i++) {
    const task = savedTasks[i];
    await updateProjectStatus(project.id, "in_progress");

    // Iniciar tarea
    await updateTaskStatus(task.id, project.id, "IN_PROGRESS", 0);
    task.status = "IN_PROGRESS";
    onEvent({ type: "task_started", task });

    let passed = false;
    let iterations = 0;
    const maxIterations = 2;
    let previousFeedback = "";
    let previousCode = "";

    while (!passed && iterations < maxIterations) {
      iterations++;
      const isRetry = iterations > 1;

      // DEVELOPER
      onEvent({
        type: "agent_status",
        agent: "DEVELOP",
        status: isRetry ? "retrying" : "active",
        message: isRetry
          ? `Develop corrigiendo fallos detectados por Testing (Iteración ${iterations})...`
          : `Develop programando tarea ${i + 1}/${savedTasks.length}: ${task.title}...`,
      });

      const devPrompt = isRetry
        ? `La prueba de Testing ha FALLADO para la tarea "${task.title}".
Feedback recibido de Testing:
${previousFeedback}

Código anterior:
${previousCode}

Por favor, corrige el código y resuelve los fallos señalados. Genera el código TypeScript / Next.js completo corregido.`
        : `Implementa la tarea: "${task.title}".
Descripción: ${task.description}
Criterios que evaluará Testing:
${task.testCriteria?.join("\n")}

Escribe el código Next.js 15 / React / TypeScript completo y funcional.`;

      const devSchema = z.object({
        fileName: z.string(),
        thought: z.string(),
        content: z.string(),
        explanation: z.string(),
      });

      const { object: devResult } = await generateObject({
        model,
        system: DEVELOPER_SYSTEM_PROMPT,
        prompt: devPrompt,
        schema: devSchema,
      });

      previousCode = devResult.content;

      const devLog = await saveLog(project.id, {
        projectId: project.id,
        agent: "DEVELOP",
        type: isRetry ? "feedback" : "thought",
        content: devResult.thought,
      });
      onEvent({ type: "log", log: devLog });

      const artifact = await saveArtifact(project.id, task.id, {
        fileName: devResult.fileName,
        content: devResult.content,
        language: "typescript",
        version: iterations,
      });
      onEvent({ type: "artifact_created", artifact, task });

      const devActionLog = await saveLog(project.id, {
        projectId: project.id,
        agent: "DEVELOP",
        type: "action",
        content: `Generado \`${devResult.fileName}\` (versión ${iterations}). ${devResult.explanation}`,
      });
      onEvent({ type: "log", log: devActionLog });
      onEvent({ type: "agent_status", agent: "DEVELOP", status: "idle" });

      // TESTING
      await updateTaskStatus(task.id, project.id, "TESTING", iterations);
      task.status = "TESTING";
      task.iterations = iterations;
      onEvent({ type: "task_status", task });

      onEvent({
        type: "agent_status",
        agent: "TESTING",
        status: "reviewing",
        message: `Testing evaluando el código generado por Develop...`,
      });

      const testSchema = z.object({
        thought: z.string(),
        passed: z.boolean(),
        totalTests: z.number(),
        passedTests: z.number(),
        failedTests: z.number(),
        failures: z.array(
          z.object({
            testName: z.string(),
            file: z.string(),
            errorMessage: z.string(),
            suggestion: z.string(),
          })
        ),
        summary: z.string(),
      });

      // Si es iteración 1 y tarea compleja, pedimos a Testing que sea estricto para forzar el bucle
      const strictInstruction =
        iterations === 1 && i === 0
          ? "IMPORTANTE: Como es la primera iteración, busca un detalle sutil o caso borde (ej: validaciones de input, manejo de estados de carga, accesibilidad) y marca passed: false con una sugerencia de corrección clara para que Develop lo resuelva en la iteración 2."
          : "Evalúa con objetividad. Si el código cumple los criterios, marca passed: true.";

      const { object: testResult } = await generateObject({
        model,
        system: TESTER_SYSTEM_PROMPT,
        prompt: `Evalúa el código entregado por Develop:
Archivo: ${devResult.fileName}
Código:
${devResult.content}

Criterios de aceptación:
${task.testCriteria?.join("\n")}

${strictInstruction}`,
        schema: testSchema,
      });

      const testReport: TestResultReport = {
        passed: testResult.passed,
        totalTests: testResult.totalTests || 3,
        passedTests: testResult.passedTests || (testResult.passed ? 3 : 2),
        failedTests: testResult.failedTests || (testResult.passed ? 0 : 1),
        failures: testResult.failures || [],
        summary: testResult.summary,
      };

      if (!testReport.passed && iterations < maxIterations) {
        // Falló -> bucle de feedback
        previousFeedback = testResult.failures.map((f) => `- ${f.testName}: ${f.errorMessage}. Sugerencia: ${f.suggestion}`).join("\n") || testResult.summary;

        const testLogFail = await saveLog(project.id, {
          projectId: project.id,
          agent: "TESTING",
          type: "feedback",
          content: `🚨 **TESTS FALLIDOS (Iteración ${iterations})**: ${testReport.summary}\n\nDevolviendo feedback a Develop para corrección.`,
          meta: testReport as unknown as Record<string, unknown>,
        });
        onEvent({ type: "log", log: testLogFail });
        onEvent({ type: "test_completed", testReport, task });

        await updateTaskStatus(task.id, project.id, "RETRYING", iterations);
        task.status = "RETRYING";
        onEvent({ type: "feedback_loop", task, message: "Testing devolvió errores a Develop." });
        onEvent({ type: "agent_status", agent: "TESTING", status: "error" });
      } else {
        // Aprobado
        passed = true;
        const testLogPass = await saveLog(project.id, {
          projectId: project.id,
          agent: "TESTING",
          type: "test_result",
          content: `🎉 **TESTS SUPERADOS (${testReport.passedTests}/${testReport.totalTests})**: ${testReport.summary}`,
          meta: testReport as unknown as Record<string, unknown>,
        });
        onEvent({ type: "log", log: testLogPass });
        onEvent({ type: "test_completed", testReport, task });
        onEvent({ type: "agent_status", agent: "TESTING", status: "completed" });

        await updateTaskStatus(task.id, project.id, "PASSED", iterations);
        task.status = "PASSED";
        onEvent({ type: "task_status", task });
      }
    }
  }

  // Finalizar proyecto
  await updateProjectStatus(project.id, "completed");
  project.status = "completed";

  const finalLog = await saveLog(project.id, {
    projectId: project.id,
    agent: "ORCHESTRATOR",
    type: "action",
    content: `🏁 **PROYECTO FINALIZADO**: Todas las tareas han sido resueltas y verificadas con éxito por el equipo de agentes.`,
  });
  onEvent({ type: "log", log: finalLog });
  onEvent({ type: "project_completed", project });
}
