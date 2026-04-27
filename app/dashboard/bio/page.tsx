"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

function cleanUsername(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "");
}

export default function BioPage() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name, bio")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setUsername(profile.username ?? "");
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
      }
    }

    loadProfile();
  }, []);

  async function saveProfile() {
    setMessage("Saving...");

    const finalUsername = cleanUsername(username);

    if (!finalUsername) {
      setMessage("Username is required.");
      return;
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();

    if (existingProfile && existingProfile.id !== userId) {
      setMessage("That username is already taken.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: finalUsername,
      display_name: displayName.trim() || finalUsername,
      bio,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setUsername(finalUsername);
    setMessage("Bio saved.");
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">Bio</h1>
        <p className="mt-2 text-zinc-500">
          Manage your public NUPHub profile.
        </p>

        <div className="mt-8 rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
              placeholder="Public username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <textarea
              className="min-h-40 w-full rounded-xl border border-zinc-300 px-4 py-3"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <button
              onClick={saveProfile}
              className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white hover:bg-zinc-700"
            >
              Save Bio
            </button>

            {message && <p className="text-sm text-zinc-500">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}