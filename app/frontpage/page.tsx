import { createClient } from "@/utils/supabase/server";

export default async function FrontPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, subtitle, slug, created_at, profiles(username, display_name)")
    .eq("status", "published")
    .eq("frontpage_approved", true)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-5xl px-6 py-14">
        <a href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to NUPHub
        </a>

        <h1 className="mt-8 text-4xl font-bold">Front Page</h1>
        <p className="mt-2 text-zinc-500">
          Featured writing from across NewUntitledPage.
        </p>

        <div className="mt-10 space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <a
                key={post.id}
                href={`/article/${post.slug}`}
                className="block rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm hover:bg-zinc-50"
              >
                <h2 className="text-2xl font-bold">{post.title}</h2>

                {post.subtitle && (
                  <p className="mt-2 text-zinc-600">{post.subtitle}</p>
                )}

                <p className="mt-4 text-sm text-zinc-400">
                  by{" "}
                  {Array.isArray(post.profiles)
                    ? post.profiles[0]?.display_name ||
                      post.profiles[0]?.username ||
                      "Unknown"
                    : "Unknown"}{" "}
                  • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </a>
            ))
          ) : (
            <div className="rounded-3xl border border-zinc-300 bg-white p-8 text-zinc-500 shadow-sm">
              No front page submissions yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}