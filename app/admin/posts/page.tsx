import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminPostsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") redirect("/dashboard");

  async function toggleFeatured(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const postId = String(formData.get("post_id"));
    const currentValue = String(formData.get("is_featured")) === "true";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") redirect("/dashboard");
    
    const admin = createAdminClient();

    const { error } = await supabase
      .from("posts")
      .update({ is_featured: !currentValue })
      .eq("id", postId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/admin/posts");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      status,
      is_featured,
      created_at,
      profiles:user_id (
        username,
        display_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-100 px-6 py-10 text-zinc-900">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-white p-6 text-red-500 shadow-sm">
          {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">User Posts</h1>

          <p className="mt-2 text-zinc-500">
            Review published posts and choose which ones appear under From The Writers.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {posts && posts.length > 0 ? (
                posts.map((post: any) => {
                  const author = post.profiles;
                  const username = author?.username;

                  return (
                    <tr
                      key={post.id}
                      className="border-t border-zinc-200 hover:bg-zinc-50"
                    >
                      <td className="px-6 py-5 font-medium">
                        {post.title}
                      </td>

                      <td className="px-6 py-5 text-zinc-500">
                        {author?.display_name || username || "Unknown"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <form action={toggleFeatured}>
                          <input type="hidden" name="post_id" value={post.id} />
                          <input
                            type="hidden"
                            name="is_featured"
                            value={String(post.is_featured)}
                          />

                          <button
                            type="submit"
                            className={`rounded-full px-4 py-2 text-xs font-semibold ${
                              post.is_featured
                                ? "bg-zinc-900 text-white hover:bg-zinc-700"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            }`}
                          >
                            {post.is_featured ? "Featured" : "Not Featured"}
                          </button>
                        </form>
                      </td>

                      <td className="px-6 py-5 text-right">
                        {username ? (
                          <Link
                            href={`/u/${username}/${post.slug}`}
                            className="text-zinc-500 hover:text-zinc-900"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-zinc-400">No page</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}