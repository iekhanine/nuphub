import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    username: string;
    slug: string;
  }>;
};

export default async function PostPage({ params }: PageProps) {
  const supabase = await createClient();
  const { username, slug } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  const authorName = profile.display_name || profile.username;

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-zinc-900">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <a
          href={`/u/${profile.username}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 print:hidden"
        >
          ← Back to {authorName}
        </a>

        <article className="mt-8 rounded-[2rem] border border-zinc-300 bg-[#fffdf7] px-8 py-10 shadow-sm md:px-16 md:py-14 print:mt-0 print:border-0 print:shadow-none">
          <header className="border-b border-zinc-300 pb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">
              New Untitled Page
            </p>

            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight uppercase tracking-tight md:text-6xl">
              {post.title}
            </h1>

            <div className="mx-auto mt-6 h-px w-24 bg-zinc-300" />

            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-zinc-500">
              By {authorName}
            </p>
          </header>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="whitespace-pre-wrap text-[1.08rem] leading-9 text-zinc-800 first-letter:text-zinc-900">
              {post.body}
            </div>
          </div>

          <footer className="mx-auto mt-14 max-w-3xl border-t border-zinc-300 pt-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Published on NUPHub
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              <a href={`/u/${profile.username}`} className="hover:underline">
                nuphub.com/u/{profile.username}
              </a>
            </p>
          </footer>
        </article>
      </section>
    </main>
  );
}