import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function TopMenu() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let username: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, username")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
    username = profile?.username ?? null;
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold">
          NUPHub
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-zinc-400 text-md hover:text-white">
            Home
          </Link>

          {user && (
            <>
              <div className="relative group py-2">
                <button href="/dashboard" className="font-semibold text-zinc-400 hover:text-white">
                  Dashboard ▾
                </button>

                <div className="absolute right-0 top-full z-50 hidden min-w-[190px] rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl group-hover:block">
                  <Link
                    href="/dashboard/new-post"
                    className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    New Post
                  </Link>

                  {username ? (
                    <Link
                      href={`/u/${username}`}
                      className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      View Page
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/bio"
                      className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Create Public Page
                    </Link>
                  )}

                  <Link
                    href="/dashboard/posts"
                    className="block rounded-b-xl px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Post History
                  </Link>
                </div>
              </div>

              <Link href="/dashboard/bio" className="text-zinc-400 hover:text-white">
                Bio
              </Link>

              {isAdmin && (
                <div className="relative group py-2">
                  <button className="font-semibold text-purple-400 hover:text-purple-300">
                    Admin ▾
                  </button>

                  <div className="absolute right-0 top-full z-50 hidden min-w-[180px] rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl group-hover:block">
                    <Link
                      href="/admin/users"
                      className="block rounded-t-xl px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Users
                    </Link>

                    <Link
                      href="/admin/posts"
                      className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Posts
                    </Link>

                    <Link
                      href="/admin/frontpage"
                      className="block rounded-b-xl px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Front Page
                    </Link>
                  </div>
                </div>
              )}

              <form action={signOut}>
                <button className="text-zinc-400 hover:text-white">
                  Logout
                </button>
              </form>
            </>
          )}

          {!user && (
            <Link href="/login" className="text-zinc-400 hover:text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}