"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
      alert(`로그인 실패: ${error.message}`);
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="w-full rounded-md bg-neutral-900 text-white py-2.5 px-4 hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "이동 중..." : "Google로 로그인"}
    </button>
  );
}
