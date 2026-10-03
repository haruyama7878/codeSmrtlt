import { generateSurveyVariant } from "@/lib/ai-api";
import { isValidSurveyVariantInput } from "@/lib/survey-variant-input";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { question?: unknown };
    if (!isValidSurveyVariantInput(body?.question)) {
      return Response.json({ message: "Câu hỏi khảo sát không hợp lệ" }, { status: 400 });
    }
    const variant = await generateSurveyVariant(body.question);
    return Response.json(variant);
  } catch (error) {
    console.error("Generate survey variant API error", error);
    return Response.json({ message: "Không thể tạo câu hỏi tương tự" }, { status: 500 });
  }
}
