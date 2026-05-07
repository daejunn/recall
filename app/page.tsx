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

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
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

      <section className="text-neutral-600">
        <p>로그인 성공.</p>
        <p className="text-xs mt-2 text-neutral-400">
          다음 단계: 책 등록 기능 (Phase 2)
        </p>
      </section>
    </main>
  );
}
