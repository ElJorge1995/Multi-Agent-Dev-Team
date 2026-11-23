import { NextResponse } from "next/server";
import { isDbConnected } from "@/lib/db";

export async function GET() {
  const dbStatus = await isDbConnected();
  const hasEnvKey = Boolean(
    process.env.OPENAI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY
  );

  return NextResponse.json({
    database: dbStatus,
    aiProvider: {
      hasEnvKey,
      defaultModel: hasEnvKey ? "LLM Real (API Key detectada)" : "Simulador Inteligente (Modo Autónomo)",
    },
    version: "1.0.0",
  });
}
