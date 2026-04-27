import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

return (
  <div className="min-h-screen bg-zinc-100 text-zinc-900">
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 rounded-3xl border border-zinc-300 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold">NUPHub Admin</h1>
      </div>

      {children}
    </div>
  </div>
);
}