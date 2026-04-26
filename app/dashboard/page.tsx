"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [postCount, setPostCount] = useState(0);
  const [message, setMessage] = useState("");

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
  const unlocked = postCount >= 15;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <a href="/" className="text-sm text-zinc-400 hover:text-white">
            ← NUPHub
          </a>

          <button onClick={signOut} className="text-sm text-zinc-400 hover:text-white">
            Sign out
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-400">{email}</p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Published Articles</p>
            <p className="mt-2 text-4xl font-bold">{postCount}</p>

            <p className="mt-3 text-sm text-zinc-400">
              {unlocked
                ? "Front Page submission unlocked."
                : `${remaining} more article${remaining === 1 ? "" : "s"} until Front Page unlock.`}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href="/dashboard/new-post"
                className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Write New Article
              </a>

              {username && (
                <a
                  href={`/u/${username}`}
                  className="rounded-xl border border-zinc-700 px-5 py-3 text-center font-semibold hover:bg-zinc-800"
                >
                  View Public Page
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <textarea
              className="min-h-32 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <button
              onClick={saveProfile}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Save Profile
            </button>

            {message && <p className="text-sm text-zinc-400">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}