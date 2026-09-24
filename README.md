# NupHub — shared OneTime Labs authentication

NupHub uses the SAME Supabase Auth users as the OneTime Labs Store, Platform, and other apps.

A Supabase account is not automatically a NupHub account.

The first time an authenticated OneTime Labs user opens NupHub:

1. They sign in with their existing email/password.
2. NupHub sees there is no `nuphub_profiles` row.
3. They are sent to `/setup`.
4. They choose a streamer handle.
5. NupHub creates only the NupHub-specific profile/settings rows.
6. They enter the dashboard.

## Existing database upgrade

If you already ran the earlier NupHub SQL:

1. Keep your existing tables/data.
2. Run:

`sql/003_shared_auth_enrollment.sql`

This removes the old global `auth.users` trigger and adds explicit NupHub enrollment.

Existing NupHub profiles are NOT deleted or changed.

## Existing OneTime Labs user test

1. Go to `/login`.
2. Sign in with an existing OneTime Labs / Store account.
3. NupHub redirects to `/setup`.
4. Pick a streamer handle.
5. Dashboard opens.

No new auth user is created.

## Brand-new user test

1. Go to `/signup`.
2. Create the shared Supabase account.
3. Confirm the email if confirmation is enabled.
4. The auth callback goes to `/setup`.
5. Pick a streamer handle.
6. Dashboard opens.

## Environment

`.env.local`

```env
VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_KEY
VITE_SITE_URL=http://localhost:5173
```

Never put a service-role key in the Vite client.

## Run

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
npm run lint
```
