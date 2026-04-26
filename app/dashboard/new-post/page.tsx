"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewPostPage() {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.user.id);
    }

    loadUser();
  }, []);

  async function publishPost() {
    setMessage("Publishing...");

    const slug = makeSlug(title);

    if (!title.trim() || !body.trim()) {
      setMessage("Title and body are required.");
      return;
    }

    if (!slug) {
      setMessage("Use a title with letters or numbers.");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      title,
      slug,
      body,
      status: "published",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Post published.");
    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <a href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
          ← Dashboard
        </a>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h1 className="text-3xl font-bold">New Article</h1>

          <div className="mt-8 space-y-4">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
              placeholder="Article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="min-h-80 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
              placeholder="Write your article..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <button
              onClick={publishPost}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Publish
            </button>

            {message && <p className="text-sm text-zinc-400">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}