import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { NoteChat } from "./note-chat";

type Props = { params: Promise<{ id: string; noteId: string }> };

export default async function NotePage({ params }: Props) {
  const { id: bookId, noteId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: note }, { data: messages }] = await Promise.all([
    supabase
      .from("notes")
      .select("id, book_id, books(title)")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("messages")
      .select("id, role, content")
      .eq("note_id", noteId)
      .order("created_at", { ascending: true }),
  ]);

  if (!note) notFound();
  const book = Array.isArray(note.books) ? note.books[0] : note.books;

  return (
    <main className="flex flex-col h-screen bg-[#fafaf8]">
      <header className="bg-white border-b border-stone-200 px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          <a
            href={`/books/${bookId}`}
            className="text-sm text-stone-500 hover:text-stone-900 transition"
          >
            ← {book?.title ?? "책으로"}
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-hidden max-w-2xl w-full mx-auto px-6 py-6 flex flex-col">
        <NoteChat
          noteId={noteId}
          bookId={bookId}
          initialMessages={(messages ?? []).map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }))}
        />
      </div>
    </main>
  );
}
