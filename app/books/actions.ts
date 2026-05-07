"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateBookMeta, type BookMeta } from "@/lib/anthropic";

export async function getBookMeta(
  title: string,
  authorHint: string,
): Promise<BookMeta> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return generateBookMeta(title, authorHint || undefined);
}

export async function createBook(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const summary = formData.get("summary") as string;
  const key_concepts = formData.get("key_concepts") as string;

  const { data, error } = await supabase
    .from("books")
    .insert({ user_id: user.id, title, author, summary, key_concepts })
    .select("id")
    .single();

  if (error || !data) redirect("/");

  redirect(`/books/${data.id}`);
}

export async function updateBook(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const summary = formData.get("summary") as string;
  const key_concepts = formData.get("key_concepts") as string;

  await supabase
    .from("books")
    .update({ title, author, summary, key_concepts })
    .eq("id", id)
    .eq("user_id", user.id);

  redirect(`/books/${id}`);
}

export async function deleteBook(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  redirect("/");
}
