import { createClient } from "@/utils/supabase/server";
import { createUser, deleteUser, updateUserRole } from "./actions";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-400">Error loading users: {error.message}</p>;
  }

  return (
  <main className="min-h-screen bg-zinc-100 text-zinc-900">
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold">Users</h1>

        <p className="mt-2 text-zinc-500">
          Manage contributor accounts, assign roles, and remove access.
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-xl font-bold">Add User</h3>

        <form action={createUser} className="grid gap-4 md:grid-cols-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <input
            name="password"
            type="password"
            placeholder="Temporary password"
            required
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <input
            name="username"
            placeholder="username"
            required
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <input
            name="displayName"
            placeholder="Display name"
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <select
            name="role"
            defaultValue="contributor"
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
          >
            <option value="contributor">Contributor</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <button className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white hover:bg-zinc-700 md:col-span-5">
            Create User
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-500">
            <tr>
              <th className="px-6 py-4">Display Name</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Change Role</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Danger</th>
            </tr>
          </thead>

          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                <td className="px-6 py-5">{user.display_name ?? "—"}</td>
                <td className="px-6 py-5 text-zinc-500">{user.username ?? "—"}</td>

                <td className="px-6 py-5">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                    {user.role ?? "contributor"}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <form action={updateUserRole.bind(null, user.id, "admin")} className="inline">
                    <button className="mr-2 rounded-full bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700">
                      Admin
                    </button>
                  </form>

                  <form action={updateUserRole.bind(null, user.id, "moderator")} className="inline">
                    <button className="mr-2 rounded-full bg-zinc-200 px-3 py-1 text-xs text-zinc-800 hover:bg-zinc-300">
                      Moderator
                    </button>
                  </form>

                  <form action={updateUserRole.bind(null, user.id, "contributor")} className="inline">
                    <button className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200">
                      Contributor
                    </button>
                  </form>
                </td>

                <td className="px-6 py-5 text-zinc-500">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="px-6 py-5">
                  <form action={deleteUser.bind(null, user.id)}>
                    <button className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </main>
);
}