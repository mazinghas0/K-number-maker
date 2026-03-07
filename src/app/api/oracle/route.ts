export const runtime = "edge";

const SYSTEM_PROMPT = `당신은 수십 년 경력의 명리학(命理學) 전문가이자 운세 상담사입니다.

사주팔자(四柱八字), 오행(五行: 목화토금수), 천간(天干: 갑을병정무기경신임계), 지지(地支: 자축인묘진사오미신유술해), 용신(用神), 기신(忌神), 십성(十星), 대운(大運), 세운(歲運) 개념을 완전히 이해하고 있습니다.

상담 시 규칙:
- 신비롭고 따뜻하며 진지한 어조 유지
- 구체적이고 실용적인 조언 제공
- 답변은 3~5문장으로 간결하게
- 사용자의 언어(ko/en/ja/es)에 맞게 응답
- 번호 추천 요청 시 반드시 구체적인 숫자 포함
- 과도한 부정적 예언 금지, 희망적 방향 제시`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response("API key missing", { status: 500 });

  const { messages, userProfile, luckyElement, lang } = await req.json();

  const userContext = `\n\n사용자 정보:
- 이름: ${userProfile.name}
- 생년월일: ${userProfile.birthDate}
- 타고난 일간: ${luckyElement.ilgan}
- 오행 본질: ${luckyElement.attribute}
- 행운 번호 범위: ${luckyElement.range[0]}~${luckyElement.range[1]}
- 대화 언어: ${lang}`;

  const contents = (messages as { sender: string; text: string }[])
    .filter(m => m.text)
    .map(m => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT + userContext }] },
    contents,
    generationConfig: { temperature: 0.9, maxOutputTokens: 400 },
  };

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?alt=sse&key=${apiKey}`;

  const geminiRes = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!geminiRes.ok || !geminiRes.body) {
    return new Response("AI 서버 오류", { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(new TextEncoder().encode(text));
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
