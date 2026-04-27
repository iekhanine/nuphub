"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function DashboardPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [postCount, setPostCount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setUsername(profile.username ?? "");
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
      }

      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", data.user.id)
        .eq("status", "published");

      setPostCount(count ?? 0);
      setLoading(false);
    }

    loadUser();
  }, []);

  async function saveProfile() {
    setMessage("Saving profile...");

    const cleanUsername = username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "");

    if (!cleanUsername) {
      setMessage("Username is required. Use letters, numbers, or underscores.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: cleanUsername,
      display_name: displayName,
      bio,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setUsername(cleanUsername);
    setMessage("Profile saved. Your NUP page is live.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const remaining = Math.max(15 - postCount, 0);
  const progress = Math.min((postCount / 15) * 100, 100);
  const unlocked = postCount >= 15;
  const name = displayName || username || email || "there";

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <header className="border-b border-zinc-300 bg-white">
        
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Welcome back
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {loading ? "Loading..." : name}
          </h1>

          <p className="mt-2 text-zinc-600">
            {loading ? "" : email}
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Published Articles</p>
              <p className="mt-2 text-5xl font-bold">
                {loading ? "—" : postCount}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 md:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Front Page Progress</p>
                  <p className="mt-2 font-semibold">
                    {loading
                      ? "Checking your progress..."
                      : unlocked
                        ? "Unlocked. You can submit to the Front Page."
                        : `${remaining} more article${
                            remaining === 1 ? "" : "s"
                          } to unlock Front Page submission.`}
                  </p>
                </div>

                <p className="text-sm font-bold text-zinc-500">
                  {loading ? "—" : `${postCount}/15`}
                </p>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-zinc-900"
                  style={{ width: `${loading ? 0 : progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <a
              href="/dashboard/new-post"
              className="rounded-2xl bg-zinc-900 p-5 text-white hover:bg-zinc-700"
            >
              <h2 className="font-bold">Write Article</h2>
              <p className="mt-2 text-sm text-zinc-300">
                Publish something new to your archive.
              </p>
            </a>

            {!loading && username ? (
              <a
                href={`/u/${username}`}
                className="rounded-2xl border border-zinc-300 bg-white p-5 hover:bg-zinc-50"
              >
                <h2 className="font-bold">View Page</h2>
                <p className="mt-2 text-sm text-zinc-600">
                  See your public NewUntitledPage.
                </p>
              </a>
            ) : (
              <div className="rounded-2xl border border-zinc-300 bg-white p-5 text-zinc-400">
                <h2 className="font-bold">View Page</h2>
                <p className="mt-2 text-sm">
                  {loading ? "Loading your profile..." : "Save a username first."}
                </p>
              </div>
            )}

            <a
              href="/frontpage"
              className="rounded-2xl border border-zinc-300 bg-white p-5 hover:bg-zinc-50"
            >
              <h2 className="font-bold">Front Page</h2>
              <p className="mt-2 text-sm text-zinc-600">
                See what the Hub is featuring.
              </p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}