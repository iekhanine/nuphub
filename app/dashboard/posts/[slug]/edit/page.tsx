import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, slug, body, status, user_id")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !post) {
    return (
      <main className="min-h-screen bg-zinc-100 text-zinc-900">
        <section className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-600 shadow-sm">
            <h1 className="text-2xl font-bold">Edit page could not load post</h1>

            <p className="mt-4">
              <strong>Slug:</strong> {slug}
            </p>

            <p className="mt-2">
              <strong>User ID:</strong> {user.id}
            </p>

            <p className="mt-2">
              <strong>Error:</strong> {error?.message || "No matching post found"}
            </p>

            <a
              href="/dashboard/posts"
              className="mt-6 inline-block rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to Post History
            </a>
          </div>
        </section>
      </main>
    );
  }
  const postId = post.id;

  async function updatePost(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const title = String(formData.get("title") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const status = String(formData.get("status") || "draft");

    if (!title || !body) {
      redirect(`/dashboard/posts/${slug}/edit`);
    }

    const newSlug = slugify(title);

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        slug: newSlug,
        body,
        status,
      })
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    redirect("/dashboard/posts");
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold">Edit Post</h1>

          <p className="mt-2 text-zinc-500">
            Update your article, save it as a draft, or publish it.
          </p>
        </div>

        <form
          action={updatePost}
          className="space-y-6 rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm"
        >
          <div>
            <label className="block text-sm font-semibold text-zinc-700">
              Title
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={post.title}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700">
              body
            </label>
            <textarea
              name="body"
              rows={16}
              required
              defaultValue={post.body}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={post.status ?? "draft"}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4">
            <a
              href="/dashboard/posts"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </a>

            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}