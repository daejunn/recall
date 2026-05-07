import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewBookForm } from "./new-book-form";

export default async function NewBookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4 mb-8">
        <a href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← 목록
        </a>
        <h1 className="text-xl font-bold">새 책 등록</h1>
      </header>
      <NewBookForm />
    </main>
  );
}
