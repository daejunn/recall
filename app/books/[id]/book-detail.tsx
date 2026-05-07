"use client";

import { useState, useTransition } from "react";
import { updateBook, deleteBook } from "../actions";

type Book = {
  id: string;
  title: string;
  author: string | null;
  summary: string | null;
  key_concepts: string | null;
};

export function BookDetail({ book }: { book: Book }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `"${book.title}"을 삭제할까요?\n이 책의 모든 노트도 함께 삭제됩니다.`,
      )
    )
      return;
    startTransition(() => deleteBook(book.id));
  }

  if (editing) {
    return (
      <form
        action={(formData) => {
          startTransition(() => {
            updateBook(book.id, formData);
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            제목
          </label>
          <input
            name="title"
            defaultValue={book.title}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            저자
          </label>
          <input
            name="author"
            defaultValue={book.author ?? ""}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            요약
          </label>
          <textarea
            name="summary"
            defaultValue={book.summary ?? ""}
            rows={4}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            핵심 개념 / 주장
          </label>
          <textarea
            name="key_concepts"
            defaultValue={book.key_concepts ?? ""}
            rows={5}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none font-mono"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800 transition disabled:opacity-40"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
          >
            취소
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {/* 제목 + 저자 */}
      <div>
        <h2 className="text-2xl font-bold">{book.title}</h2>
        {book.author && (
          <p className="text-neutral-500 mt-1">{book.author}</p>
        )}
      </div>

      {/* 요약 */}
      {book.summary && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
            요약
          </h3>
          <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
            {book.summary}
          </p>
        </section>
      )}

      {/* 핵심 개념 */}
      {book.key_concepts && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
            핵심 개념 / 주장
          </h3>
          <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap font-mono">
            {book.key_concepts}
          </p>
        </section>
      )}

      {/* 노트 영역 — Phase 3 */}
      <section className="border-t border-neutral-200 pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
          노트
        </h3>
        <p className="text-sm text-neutral-400">Phase 3에서 구현 예정</p>
      </section>

      {/* 수정 / 삭제 */}
      <div className="flex gap-3 border-t border-neutral-200 pt-4">
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm text-red-500 underline hover:text-red-700 disabled:opacity-40"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
