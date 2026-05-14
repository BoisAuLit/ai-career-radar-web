import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { classifySystemPrompt } from "@/lib/prompts";
import type { Classification } from "@/lib/types";

export const maxDuration = 30;

const MODEL = "claude-sonnet-4-6";

export async function POST(req: Request): Promise<Response> {
  const body: { target?: string } = await req.json();
  const target = (body.target || "").trim();
  if (!target) {
    return Response.json(
      { error: "Missing 'target' in request body" },
      { status: 400 },
    );
  }

  const result = await generateText({
    model: anthropic(MODEL),
    system: classifySystemPrompt(),
    messages: [
      {
        role: "user",
        content: `User says they want: "${target}"`,
      },
    ],
  });

  // Parse JSON from the response, stripping markdown fences if any
  let raw = result.text.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```[a-z]*\n/i, "").replace(/\n```$/i, "");
    raw = raw.trim();
  }

  let parsed: Classification;
  try {
    parsed = JSON.parse(raw) as Classification;
  } catch (e) {
    return Response.json(
      {
        error: "Classifier returned invalid JSON",
        detail: e instanceof Error ? e.message : String(e),
        raw,
      },
      { status: 502 },
    );
  }

  return Response.json(parsed);
}
