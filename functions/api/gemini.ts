interface Env {
  GEMINI_API_KEY: string;
}

interface GeminiRequestBody {
  system_instruction?: { parts: { text: string }[] };
  contents: { role: string; parts: { text: string }[] }[];
  generationConfig?: { temperature?: number; maxOutputTokens?: number };
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // API 키 미설정 시 500
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Origin 검증 (k-number-maker.pages.dev 또는 localhost만 허용)
  const origin = request.headers.get("origin") ?? "";
  const allowed =
    origin.endsWith("k-number-maker.pages.dev") ||
    origin.startsWith("http://localhost");

  if (!allowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: GeminiRequestBody;
  try {
    body = await request.json<GeminiRequestBody>();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const geminiRes = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await geminiRes.json();

  return new Response(JSON.stringify(data), {
    status: geminiRes.status,
    headers: { "Content-Type": "application/json" },
  });
};
