"use client";

import { useState, useTransition } from "react";
import { getBookMeta, createBook } from "../actions";

export function NewBookForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");
  const [keyConcepts, setKeyConcepts] = useState("");
  const [generated, setGenerated] = useState(false);
  const [unknownBook, setUnknownBook] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (!title.trim()) return;
    startTransition(async () => {
      const meta = await getBookMeta(title.trim(), author.trim());
      if (meta.known) {
        if (meta.author && !author) setAuthor(meta.author);
        setSummary(meta.summary);
        setKeyConcepts(meta.key_concepts);
        setUnknownBook(false);
      } else {
        setUnknownBook(true);
      }
      setGenerated(true);
    });
  }

  return (
    <div className="space-y-6">
      {/* 제목 + 저자 */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1.5">
            책 제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 사피엔스"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder:text-stone-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1.5">
            저자{" "}
            <span className="text-stone-400 font-normal normal-case">(선택)</span>
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="예: 유발 하라리"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder:text-stone-400"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!title.trim() || isPending}
          className="rounded-lg bg-stone-900 text-white px-4 py-2 text-sm hover:bg-stone-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "AI에게 정리 요청 중..." : "AI에게 정리 요청"}
        </button>
      </div>

      {/* AI 결과 or 모름 메시지 */}
      {generated && (
        <div className="space-y-4 border-t border-stone-200 pt-6">
          {unknownBook && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
              이 책은 잘 모르겠어. 아래 칸을 직접 채워줄래?
            </p>
          )}

          <form action={createBook} className="space-y-4">
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="author" value={author} />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1.5">
                요약
              </label>
              <textarea
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="핵심 주장을 2-3문장으로"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1.5">
                핵심 개념 / 주장
              </label>
              <textarea
                name="key_concepts"
                value={keyConcepts}
                onChange={(e) => setKeyConcepts(e.target.value)}
                rows={5}
                placeholder={"• 개념 하나\n• 개념 둘"}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none font-mono placeholder:text-stone-400"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-stone-900 text-white px-4 py-2 text-sm hover:bg-stone-800 transition"
              >
                저장
              </button>
              <a
                href="/"
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition"
              >
                취소
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
