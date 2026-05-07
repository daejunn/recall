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

  const { data: book } = await supabase
    .from("books")
    .select("id, title, author, summary, key_concepts")
    .eq("id", id)
    .single();

  if (!book) notFound();

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4 mb-8">
        <a href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← 목록
        </a>
      </header>
      <BookDetail book={book} />
    </main>
  );
}
