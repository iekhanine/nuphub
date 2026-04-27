import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: any = null;
  let userPostCount = 0;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, display_name, role")
      .eq("id", user.id)
      .single();

    profile = profileData;

    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "published");

    userPostCount = count ?? 0;
  }

  const { data: userFeaturedPosts } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      created_at,
      is_featured,
      status,
      profiles:user_id (
        username,
        display_name
      )
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: hubPosts } = await supabase
    .from("frontpage_posts")
    .select("id, title, slug, excerpt, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(5);

  const displayName =
    profile?.display_name || profile?.username || user?.email || "Writer";

  const remaining = Math.max(15 - userPostCount, 0);
  const unlocked = userPostCount >= 15;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-6xl px-6 py-12">

        {user ? (
          <div className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Welcome back
            </p>

            <h1 className="mt-3 text-4xl font-bold">{displayName}</h1>

            <p className="mt-2 text-zinc-600">
              You have published {userPostCount} article
              {userPostCount === 1 ? "" : "s"}.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Go to Dashboard
              </Link>

              <Link
                href="/dashboard/new-post"
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
              >
                Write New Post
              </Link>

              {profile?.username && (
                <Link
                  href={`/u/${profile.username}`}
                  className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  View My Page
                </Link>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-zinc-100 p-5">
              <p className="text-sm font-semibold text-zinc-700">
                Front Page Progress
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                {unlocked
                  ? "Unlocked. You can submit posts for the user featured front page."
                  : `${remaining} more published article${
                      remaining === 1 ? "" : "s"
                    } needed to unlock front page submission.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Welcome to NUPHub
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Build your archive. Earn the front page.
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-600">
              Writers publish stories, build credibility, and unlock visibility through consistent posting.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <section>
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                User Featured
              </p>
              <h2 className="mt-2 text-2xl font-bold">Writer Highlights</h2>
            </div>

            <div className="rounded-2xl border border-zinc-300 bg-white p-2 text-zinc-500 shadow-sm">
              {userFeaturedPosts && userFeaturedPosts.length > 0 ? (
                userFeaturedPosts.map((post: any, index: number) => (
                  <div
                    key={post.id}
                    className={`px-4 py-4 ${
                      index !== userFeaturedPosts.length - 1
                        ? "border-b border-zinc-200"
                        : ""
                    }`}
                  >
                    <Link
                      href={`/u/${post.profiles?.username}/${post.slug}`}
                      className="block hover:text-zinc-900"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold uppercase italic text-zinc-700">
                          {post.title}
                        </h3>

                        <span className="text-xs text-zinc-400">
                          by{" "}
                          {post.profiles?.display_name ||
                            post.profiles?.username ||
                            "Unknown"}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-6 text-zinc-500">
                  No user featured posts yet.
                </div>
              )}
            </div>
          </section>

          <div className="hidden w-px bg-zinc-300 lg:block" />

          <section>
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Featured From The Hub
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Site News & Official Posts
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-300 bg-white p-2 text-zinc-500 shadow-sm">
              {hubPosts && hubPosts.length > 0 ? (
                hubPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className={`px-4 py-4 ${
                      index !== hubPosts.length - 1
                        ? "border-b border-zinc-200"
                        : ""
                    }`}
                  >
                    <Link
                      href={`/frontpage/${post.slug}`}
                      className="block hover:text-zinc-900"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold uppercase italic text-zinc-700">
                          {post.title}
                        </h3>

                        <span className="text-xs text-zinc-400">
                          by NUPHub Staff
                        </span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-6 text-zinc-500">No hub posts yet.</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}