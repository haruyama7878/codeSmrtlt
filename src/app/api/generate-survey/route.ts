import { generateSurvey } from "@/lib/ai-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { count?: unknown };
    const count = typeof body?.count === "number" ? Math.max(1, Math.min(30, Math.round(body.count))) : 30;
    const survey = await generateSurvey({ count });
    return Response.json(survey);
  } catch (error) {
    console.error("Generate survey API error", error);
    return Response.json({ message: "Không thể tạo đề khảo sát" }, { status: 500 });
  }
}
