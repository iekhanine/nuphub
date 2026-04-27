import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function FrontPagePost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("frontpage_posts")
    .select("title, excerpt, content, status, created_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-4xl px-6 py-12">
        <article className="rounded-3xl border border-zinc-300 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Featured From The Hub
          </p>

          <h1 className="mt-3 text-3xl uppercase font-bold tracking-tight">
            {post.title}
          </h1>

          <p className="mt-4 text-sm text-zinc-400">
            Published {new Date(post.created_at).toLocaleDateString()} by NUPHub Team 
          </p>

          <div className="mt-8 whitespace-pre-wrap leading-8 text-zinc-700">
            {post.content}
          </div>
        </article>
      </section>
    </main>
  );
}