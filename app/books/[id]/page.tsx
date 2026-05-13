import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BookDetail } from "./book-detail";

type Props = { params: Promise<{ id: string }> };

export default async function BookPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: book }, { data: notes }] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, author, summary, key_concepts")
      .eq("id", id)
      .single(),
    supabase
      .from("notes")
      .select("id, created_at, messages(content, role)")
      .eq("book_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("created_at", { ascending: true, referencedTable: "messages" })
      .limit(1, { referencedTable: "messages" }),
  ]);

  if (!book) notFound();

  return (
    <main className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <a
            href="/"
            className="text-sm text-stone-500 hover:text-stone-900 transition"
          >
            ← 목록
          </a>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <BookDetail book={book} notes={notes ?? []} bookId={id} />
      </div>
    </main>
  );
}
