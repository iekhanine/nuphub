import { createClient } from "@/utils/supabase/server";

export default async function AuthDebugPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <pre className="p-6 whitespace-pre-wrap">
      {JSON.stringify(
        {
          hasUser: !!user,
          userId: user?.id,
          email: user?.email,
          error: error?.message,
        },
        null,
        2
      )}
    </pre>
  );
}