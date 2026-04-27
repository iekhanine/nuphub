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
    <div>
      <h2 className="mb-4 text-2xl font-bold">Users</h2>

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="mb-4 text-xl font-semibold">Add User</h3>

        <form action={createUser} className="grid gap-4 md:grid-cols-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm"
          />

          <input
            name="password"
            type="password"
            placeholder="Temporary password"
            required
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm"
          />

          <input
            name="username"
            placeholder="username"
            required
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm"
          />

          <input
            name="displayName"
            placeholder="Display name"
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm"
          />

          <select
            name="role"
            defaultValue="contributor"
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm"
          >
            <option value="contributor">Contributor</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <button className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-950 hover:bg-gray-200 md:col-span-5">
            Create User
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3">Display Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Change Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Danger</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.display_name ?? "—"}</td>
                <td className="px-4 py-3">{user.username ?? "—"}</td>

                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-800 px-3 py-1 text-xs">
                    {user.role ?? "contributor"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <form
                    action={updateUserRole.bind(null, user.id, "admin")}
                    className="inline"
                  >
                    <button className="mr-2 rounded bg-purple-700 px-3 py-1 text-xs hover:bg-purple-600">
                      Admin
                    </button>
                  </form>

                  <form
                    action={updateUserRole.bind(null, user.id, "moderator")}
                    className="inline"
                  >
                    <button className="mr-2 rounded bg-blue-700 px-3 py-1 text-xs hover:bg-blue-600">
                      Moderator
                    </button>
                  </form>

                  <form
                    action={updateUserRole.bind(null, user.id, "contributor")}
                    className="inline"
                  >
                    <button className="rounded bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600">
                      Contributor
                    </button>
                  </form>
                </td>

                <td className="px-4 py-3 text-gray-400">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="px-4 py-3">
                  <form action={deleteUser.bind(null, user.id)}>
                    <button className="rounded bg-red-800 px-3 py-1 text-xs hover:bg-red-700">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}