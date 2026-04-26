import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    username: string;
    slug: string;
  }>;
};

export default async function PostPage({ params }: PageProps) {
  const { username, slug } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <article className="mx-auto max-w-3xl px-6 py-12">
        <a
          href={`/u/${profile.username}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Back to {profile.display_name || profile.username}
        </a>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-500">
            By @{profile.username}
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {post.title}
          </h1>

          <div className="mt-8 whitespace-pre-wrap text-lg leading-8 text-zinc-300">
            {post.body}
          </div>
        </div>
      </article>
    </main>
  );
}