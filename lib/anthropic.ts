import Anthropic from "@anthropic-ai/sdk";

export type BookMeta = {
  known: boolean;
  author: string;
  summary: string;
  key_concepts: string;
};

export async function generateBookMeta(
  title: string,
  authorHint?: string,
): Promise<BookMeta> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `다음 책의 핵심 내용을 JSON으로 정리해줘.

책 제목: ${title}${authorHint ? `\n저자: ${authorHint}` : ""}

이 책을 잘 알면 아래 형식으로 한국어로 답해줘:
{
  "known": true,
  "author": "저자명 (모르면 빈 문자열)",
  "summary": "핵심 주장 2-3문장",
  "key_concepts": "핵심 개념·주장 목록 (줄바꿈으로 구분, 각 항목 앞에 • 붙이기)"
}

이 책을 잘 모르거나 확신이 없으면:
{
  "known": false,
  "author": "",
  "summary": "",
  "key_concepts": ""
}

JSON만 반환. 다른 설명 없이.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(text.trim());
    return {
      known: Boolean(parsed.known),
      author: parsed.author ?? "",
      summary: parsed.summary ?? "",
      key_concepts: parsed.key_concepts ?? "",
    };
  } catch {
    return { known: false, author: "", summary: "", key_concepts: "" };
  }
}
