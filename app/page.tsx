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
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#fafaf8]">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Recall
            </h1>
            <p className="text-sm text-stone-500">
              한 번 읽은 책을 기억으로 정착시키는 도구
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <LoginButton />
          </div>
        </div>
      </main>
    );
  }

  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white border-b border-stone-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-stone-900 tracking-tight">Recall</h1>
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-xs text-stone-400 hidden sm:block truncate max-w-[180px]">
              {user.email}
            </span>
            <button
              type="submit"
              className="text-sm text-stone-500 hover:text-stone-900 transition"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-stone-900">
            내 책{" "}
            <span className="text-stone-400 font-normal text-sm">
              ({books?.length ?? 0})
            </span>
          </h2>
          <a
            href="/books/new"
            className="rounded-lg bg-stone-900 text-white px-3 py-1.5 text-sm hover:bg-stone-800 transition"
          >
            + 새 책 등록
          </a>
        </div>

        {!books || books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-stone-400">아직 등록된 책이 없어요.</p>
            <a
              href="/books/new"
              className="mt-3 inline-block text-sm underline text-stone-500 hover:text-stone-900 transition"
            >
              첫 책을 등록해 보세요 →
            </a>
          </div>
        ) : (
          <ul className="space-y-2">
            {books.map((book) => (
              <li key={book.id}>
                <a
                  href={`/books/${book.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-stone-200 px-5 py-4 hover:border-stone-300 hover:shadow-sm transition group"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 truncate">
                      {book.title}
                    </p>
                    {book.author && (
                      <p className="text-sm text-stone-400 mt-0.5 truncate">
                        {book.author}
                      </p>
                    )}
                  </div>
                  <span className="text-stone-300 ml-3 group-hover:text-stone-500 transition text-xl leading-none">
                    ›
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
