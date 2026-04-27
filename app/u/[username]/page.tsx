import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserPage({ params }: PageProps) {
  const supabase = await createClient();
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const authorName = profile.display_name || profile.username;

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-zinc-900">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <a
          href="/"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 print:hidden"
        >
          ← NUPHub
        </a>

        <div className="mt-8 rounded-[2rem] border border-zinc-300 bg-[#fffdf7] px-8 py-10 shadow-sm md:px-16 md:py-14">
          <header className="border-b border-zinc-300 pb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">
              New Untitled Page
            </p>

            <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold uppercase leading-tight tracking-tight md:text-7xl">
              {authorName}
            </h1>

            <div className="mx-auto h-px w-24 bg-zinc-300" />

            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-zinc-500">
              @{profile.username}
            </p>
          </header>

          <section className="mx-auto mt-6 max-w-3xl">

            {!posts || posts.length === 0 ? (
              <p className="text-center text-zinc-500">No articles yet.</p>
            ) : (
              <div className="divide-y divide-zinc-300">
                {posts.map((post) => (
                  <a
                    key={post.id}
                    href={`/u/${profile.username}/${post.slug}`}
                    className="block py-7 hover:bg-[#f7f3ea]"
                  >
                    <h2 className="text-2xl font-bold tracking-tight uppercase text-zinc-900">
                      {post.title}
                    </h2>
                    
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
                      Read Article →
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>

          <footer className="mx-auto mt-14 max-w-3xl border-t border-zinc-300 pt-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Published on NUPHub
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              nuphub.com/u/{profile.username}
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}