import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <a href="/" className="text-sm text-zinc-400 hover:text-white">
          ← NUPHub
        </a>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-500">NewUntitledPage</p>

          <h1 className="mt-2 text-4xl font-bold">
            {profile.display_name || profile.username}
          </h1>

          <p className="mt-2 text-zinc-400">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-6 whitespace-pre-wrap text-zinc-300">
              {profile.bio}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-xl font-semibold">Articles</h2>

          {!posts || posts.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              No articles yet.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={`/u/${profile.username}/${post.slug}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-950 p-5 hover:bg-zinc-900"
                >
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {post.body}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}