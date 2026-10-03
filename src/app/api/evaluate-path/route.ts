import { evaluatePathWithAI, type EvaluatePathInput } from "@/lib/ai-api";
import { evaluatePathLocal } from "@/lib/placement";

export const dynamic = "force-dynamic";

function isEvaluatePathInput(value: unknown): value is EvaluatePathInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<EvaluatePathInput>;
  if (!input.placement || typeof input.placement !== "object") return false;
  const placement = input.placement as Record<string, unknown>;
  if (
    typeof placement.level !== "number" ||
    typeof placement.lessonIndex !== "number" ||
    !Array.isArray(placement.perLevelCorrect)
  ) {
    return false;
  }
  return input.attempts === undefined || Array.isArray(input.attempts);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as unknown;
    if (!isEvaluatePathInput(body)) {
      return Response.json({ message: "Dữ liệu đánh giá không hợp lệ" }, { status: 400 });
    }
    const input = body as EvaluatePathInput;
    let evaluation;
    try {
      evaluation = await evaluatePathWithAI(input);
    } catch (error) {
      console.error("Evaluate path AI error, using local fallback", error);
      evaluation = { source: "local", evaluation: evaluatePathLocal(input.placement, input.attempts) };
    }
    return Response.json(evaluation);
  } catch (error) {
    console.error("Evaluate path API error", error);
    return Response.json({ message: "Không thể đánh giá lộ trình" }, { status: 500 });
  }
}
