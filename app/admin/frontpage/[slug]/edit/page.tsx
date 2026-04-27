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

export default async function EditFrontPagePost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("frontpage_posts")
    .select("id, title, slug, excerpt, content, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !post) {
    return (
      <main className="min-h-screen bg-zinc-100 text-zinc-900">
        <section className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-600 shadow-sm">
            <h1 className="text-2xl font-bold">Could not load front page post</h1>

            <p className="mt-4">
              <strong>Slug:</strong> {slug}
            </p>

            <p className="mt-2">
              <strong>Error:</strong> {error?.message || "No matching post found"}
            </p>

            <a
              href="/admin/frontpage"
              className="mt-6 inline-block rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to Front Page Admin
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

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const status = String(formData.get("status") || "draft");

    if (!title || !content) {
      redirect(`/admin/frontpage/${slug}/edit`);
    }

    const newSlug = slugify(title);

    const { error } = await supabase
      .from("frontpage_posts")
      .update({
        title,
        slug: newSlug,
        excerpt,
        content,
        status,
      })
      .eq("id", postId);

    if (error) {
      throw new Error(error.message);
    }

    redirect("/admin/frontpage");
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">Edit Front Page Post</h1>

          <p className="mt-2 text-zinc-500">
            Update official NUPHub news, announcements, and featured articles.
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
              Excerpt
            </label>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={post.excerpt ?? ""}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700">
              Content
            </label>
            <textarea
              name="content"
              rows={16}
              required
              defaultValue={post.content}
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
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4">
            <a
              href="/admin/frontpage"
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