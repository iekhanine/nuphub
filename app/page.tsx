export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400">
          NewUntitledPage reborn
        </p>

        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          NUPHub
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-300">
          Build your page. Write your way up. Reach the front page.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/login"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Join NUPHub
          </a>

          <a
            href="/frontpage"
            className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-100 transition hover:bg-zinc-900"
          >
            View Front Page
          </a>
        </div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="font-semibold">Your Page</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Every user gets a personal writing page.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="font-semibold">15 Posts</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Publish 15 articles to unlock front-page submission.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="font-semibold">Earn Visibility</h2>
            <p className="mt-2 text-sm text-zinc-400">
              NUPHub rewards consistency instead of algorithm chasing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}