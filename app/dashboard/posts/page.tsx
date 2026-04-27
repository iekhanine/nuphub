import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPostsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
  .from("profiles")
  .select("username")
  .eq("id", user.id)
  .single();

  async function toggleStatus(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const postId = String(formData.get("post_id"));
    const currentStatus = String(formData.get("status"));

    const newStatus = currentStatus === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("posts")
      .update({ status: newStatus })
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/posts");
    revalidatePath("/");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, status, created_at")
    .eq("user_id", user.id)
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold">Post History</h1>
            <p className="mt-2 text-zinc-500">
              View, publish, unpublish, and manage your posts.
            </p>
          </div>

          <Link
            href="/dashboard/new-post"
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            New Post
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-t border-zinc-200 hover:bg-zinc-50"
                  >
                    <td className="px-6 py-5 font-medium">{post.title}</td>

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

                    <td className="px-6 py-5 text-zinc-500">{post.slug}</td>

                    <td className="px-6 py-5 text-zinc-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-5">
{post.status === "published" && profile?.username ? (
  <Link
    href={`/u/${profile.username}/${post.slug}`}
    className="text-zinc-500 hover:text-zinc-900"
  >
    View
  </Link>
) : (
  <span className="text-zinc-300">View</span>
)}

                        <Link
                          href={`/dashboard/posts/${post.slug}/edit`}
                          className="font-semibold text-zinc-900 hover:text-zinc-600"
                        >
                          Edit
                        </Link>

                        <form action={toggleStatus}>
                          <input type="hidden" name="post_id" value={post.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={post.status}
                          />

<button
  type="submit"
  className={`w-24 rounded-full px-4 py-2 text-xs font-semibold ${
    post.status === "published"
      ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      : "bg-zinc-900 text-white hover:bg-zinc-700"
  }`}
>
  {post.status === "published" ? "Unpublish" : "Publish"}
</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No posts yet.
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