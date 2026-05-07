"use client";

import { useRef, useState, useTransition } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function NoteChat({
  noteId,
  bookId,
  initialMessages,
}: {
  noteId: string;
  bookId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || streaming) return;

    setInput("");

    // Optimistically add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add placeholder for assistant
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreaming(true);

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, content }),
      });

      if (!res.ok || !res.body) throw new Error("응답 실패");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const current = accumulated;
        startTransition(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: current } : m,
            ),
          );
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "오류가 발생했어. 다시 시도해줘." }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-12">
            이 책에서 떠오른 생각을 먼저 써보세요.
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                msg.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-neutral-900 text-white px-4 py-2.5 text-sm"
                  : "max-w-[80%] rounded-2xl rounded-tl-sm bg-neutral-100 text-neutral-900 px-4 py-2.5 text-sm"
              }
            >
              {msg.content || (
                <span className="text-neutral-400 animate-pulse">…</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-neutral-200 pt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="떠오른 생각을 써보세요… (Shift+Enter로 줄바꿈)"
          disabled={streaming}
          rows={3}
          className="flex-1 resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="self-end rounded-xl bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800 transition disabled:opacity-40"
        >
          {streaming ? "…" : "전송"}
        </button>
      </form>
    </div>
  );
}
