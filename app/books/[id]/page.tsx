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
      .limit(1, { foreignTable: "messages" }),
  ]);

  if (!book) notFound();

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4 mb-8">
        <a href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← 목록
        </a>
      </header>
      <BookDetail book={book} notes={notes ?? []} bookId={id} />
    </main>
  );
}
