"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    setMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created. Check your email to confirm signup.");
  }

async function signIn() {
  setMessage("Signing in...");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  window.location.href = "/dashboard";
}

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <a href="/" className="mb-8 text-sm text-zinc-400 hover:text-white">
          ← Back to NUPHub
        </a>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h1 className="text-3xl font-bold">Join NUPHub</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create your NewUntitledPage account.
          </p>

          <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-white"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-white"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={signIn}
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Sign In
            </button>

            <a
              href="/signup"
              className="block w-full rounded-xl border border-zinc-700 px-4 py-3 text-center font-semibold hover:bg-zinc-800"
            >
              Create Account
            </a>

            {message && <p className="text-sm text-zinc-400">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}