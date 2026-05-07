import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { LoginButton } from "./login-button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
        <div className="max-w-sm w-full space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Recall</h1>
            <p className="text-sm text-neutral-500">
              한 번 읽은 책을 기억으로 정착시키는 도구
            </p>
          </div>
          <LoginButton />
        </div>
      </main>
    );
  }

  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-8">
        <h1 className="text-2xl font-bold">Recall</h1>
        <form action={signOut} className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">{user.email}</span>
          <button
            type="submit"
            className="text-sm text-neutral-700 underline hover:text-neutral-900"
          >
            로그아웃
          </button>
        </form>
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-700">
          내 책 ({books?.length ?? 0})
        </h2>
        <a
          href="/books/new"
          className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm hover:bg-neutral-800 transition"
        >
          + 새 책 등록
        </a>
      </div>

      {!books || books.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p>아직 등록된 책이 없어요.</p>
          <a
            href="/books/new"
            className="mt-3 inline-block text-sm underline text-neutral-500 hover:text-neutral-900"
          >
            첫 책을 등록해 보세요 →
          </a>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {books.map((book) => (
            <li key={book.id}>
              <a
                href={`/books/${book.id}`}
                className="flex flex-col py-4 hover:bg-neutral-50 -mx-2 px-2 rounded-md transition"
              >
                <span className="font-medium text-neutral-900">
                  {book.title}
                </span>
                {book.author && (
                  <span className="text-sm text-neutral-500 mt-0.5">
                    {book.author}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
