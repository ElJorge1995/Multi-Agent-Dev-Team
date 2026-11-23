import { NextRequest } from "next/server";
import { runMockWorkflow } from "@/lib/agents/mock-engine";
import { runLiveWorkflow } from "@/lib/agents/live-engine";
import { StreamEvent } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { prompt, mode = "auto", apiKey, provider } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "El prompt es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (event: StreamEvent) => {
      try {
        const payload = `data: ${JSON.stringify(event)}\n\n`;
        await writer.write(encoder.encode(payload));
      } catch (err) {
        console.error("Error writing to stream:", err);
      }
    };

    // Determine whether to run live LLM or mock
    const hasEnvKey = Boolean(
      process.env.OPENAI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GEMINI_API_KEY
    );
    const shouldUseLive =
      mode === "live" || (mode === "auto" && (Boolean(apiKey) || hasEnvKey));

    // Run async in background attached to stream
    (async () => {
      try {
        if (shouldUseLive) {
          try {
            await runLiveWorkflow(prompt, sendEvent, apiKey, provider);
          } catch (liveError: unknown) {
            console.warn("Live workflow failed, falling back to mock:", liveError);
            const errMsg = liveError instanceof Error ? liveError.message : String(liveError);
            await sendEvent({
              type: "log",
              log: {
                projectId: "",
                agent: "ORCHESTRATOR",
                type: "error",
                content: `Nota: El proveedor de IA respondió con un aviso (${errMsg}). Continuando la ejecución con el motor de simulación de alta fidelidad.`,
              },
            });
            await runMockWorkflow(prompt, sendEvent);
          }
        } else {
          await runMockWorkflow(prompt, sendEvent);
        }
      } catch (fatalError: unknown) {
        console.error("Workflow fatal error:", fatalError);
        const errMsg = fatalError instanceof Error ? fatalError.message : String(fatalError);
        await sendEvent({
          type: "error",
          message: errMsg || "Ocurrió un error inesperado al ejecutar el equipo de agentes.",
        });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("API /api/run error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
