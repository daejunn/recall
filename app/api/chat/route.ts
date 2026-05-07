import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = (
  title: string,
  author: string | null,
  summary: string | null,
  keyConcepts: string | null,
) => `당신은 독서 회상 대화 도우미입니다.
사용자가 "${title}"${author ? ` (${author})` : ""}을 읽고 나서 인사이트를 의식적 기억으로 정착시키도록 돕습니다.

${summary || keyConcepts ? `이 책에 대한 객관적 정보:\n${summary ?? ""}\n\n핵심 개념:\n${keyConcepts ?? ""}` : ""}

행동 원칙:
- 사용자가 먼저 말하기 전까지 절대 인사이트를 제시하지 않습니다.
- 사용자가 생각을 던지면, 더 깊이 파고드는 질문을 합니다. 예: "왜 그 부분이 특히 기억에 남아?", "네 경험 중 어떤 것과 연결돼?", "이 개념이 다른 무언가와 어떻게 다른 것 같아?"
- 사용자의 기억이 부정확해 보이면 단정하지 않고 가능성으로 제시합니다. 예: "내가 알기로는 ___에 가까운 것 같은데, 어떻게 봐?"
- 길게 설명하지 않습니다. 짧게, 질문 위주로 대화를 이어갑니다.
- 한국어로만 답합니다.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { noteId, content } = await request.json();
  if (!noteId || !content?.trim()) {
    return new Response("Bad request", { status: 400 });
  }

  // Fetch note + book context
  const { data: note } = await supabase
    .from("notes")
    .select("id, book_id, books(title, author, summary, key_concepts)")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (!note) return new Response("Not found", { status: 404 });

  const book = Array.isArray(note.books) ? note.books[0] : note.books;

  // Save user message
  await supabase.from("messages").insert({
    note_id: noteId,
    user_id: user.id,
    role: "user",
    content: content.trim(),
  });

  // Fetch full conversation history for context
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });

  const messages = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: SYSTEM_PROMPT(
            book?.title ?? "",
            book?.author ?? null,
            book?.summary ?? null,
            book?.key_concepts ?? null,
          ),
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }

        // Save assistant message after stream completes
        if (fullResponse) {
          await supabase.from("messages").insert({
            note_id: noteId,
            user_id: user.id,
            role: "assistant",
            content: fullResponse,
          });
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
