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
    <main className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a
            href="/"
            className="text-sm text-stone-500 hover:text-stone-900 transition"
          >
            ← 목록
          </a>
          <h1 className="text-base font-semibold text-stone-900">새 책 등록</h1>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <NewBookForm />
      </div>
    </main>
  );
}
