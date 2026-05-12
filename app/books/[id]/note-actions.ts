"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteNote(noteId: string, bookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id);
  redirect(`/books/${bookId}`);
}

export async function createNote(bookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data, error } = await supabase
    .from("notes")
    .insert({ book_id: bookId, user_id: user.id })
    .select("id")
    .single();

  if (error || !data) redirect(`/books/${bookId}`);

  redirect(`/books/${bookId}/notes/${data.id}`);
}
