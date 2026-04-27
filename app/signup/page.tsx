"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

function cleanUsername(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "");
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  async function createAccount() {
    setMessage("Creating account...");

    const finalUsername = cleanUsername(username);
    const finalEmail = email.trim().toLowerCase();

    if (!finalUsername || !finalEmail || !password.trim()) {
      setMessage("Username, email, and password are required.");
      return;
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();

    if (existingProfile) {
      setMessage("That username is already taken.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: finalEmail,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data.user) {
      setMessage("Account created. Check your email to confirm signup.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      username: finalUsername,
      email: finalEmail,
      display_name: displayName.trim() || finalUsername,
      role: "contributor",
    });

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    setMessage("Account created. You can now log in.");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <a href="/login" className="mb-8 text-sm text-zinc-400 hover:text-white">
          ← Back to Login
        </a>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Use your email to log in. Your username is your public NUPHub page.
          </p>

          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
              placeholder="Permanent @name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={createAccount}
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Create Account
            </button>

            {message && <p className="text-sm text-zinc-400">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}