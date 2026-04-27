// app/admin/page.tsx

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Link
        href="/admin/users"
        className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:bg-gray-800"
      >
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="mt-2 text-gray-400">Manage roles and public profiles.</p>
      </Link>

      <Link
        href="/admin/posts"
        className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:bg-gray-800"
      >
        <h2 className="text-xl font-semibold">Posts</h2>
        <p className="mt-2 text-gray-400">Review and moderate articles.</p>
      </Link>

      <Link
        href="/dashboard"
        className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:bg-gray-800"
      >
        <h2 className="text-xl font-semibold">Back to Dashboard</h2>
        <p className="mt-2 text-gray-400">Return to your normal account area.</p>
      </Link>
    </div>
  );
}