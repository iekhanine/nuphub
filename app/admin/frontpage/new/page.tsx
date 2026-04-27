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

export default async function NewFrontPagePost() {
  async function createPost(formData: FormData) {
    "use server";

    const supabase = await createClient();

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

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const status = String(formData.get("status") || "draft");

    if (!title || !content) {
      redirect("/admin/frontpage/new");
    }

    const slug = slugify(title);

    const { error } = await supabase.from("frontpage_posts").insert({
      title,
      slug,
      excerpt,
      content,
      status,
      author_id: user.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect("/admin/frontpage");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Front Page Post</h1>
        <p className="mt-2 text-zinc-500">
          Create official NUPHub updates, site news, features, or announcements.
        </p>
      </div>

      <form action={createPost} className="space-y-6 rounded-2xl border border-zinc-300 bg-white p-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-700">
            Title
          </label>
          <input
            name="title"
            type="text"
            required
            className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
            placeholder="Example: Welcome to NUPHub"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            rows={3}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
            placeholder="Short teaser shown on the homepage..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700">
            content
          </label>
          <textarea
            name="content"
            rows={12}
            required
            className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
            placeholder="Write the full post here..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700">
            Status
          </label>
          <select
            name="status"
            defaultValue="draft"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
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
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Create Post
          </button>
        </div>
      </form>
    </main>
  );
}