# NupHub Owner / Admin Users

## 1. Database migrations

Run these in Supabase SQL Editor in order if you have not already:

1. `sql/011_nuphub_product_tiers_square.sql`
2. `sql/012_owner_admin_users.sql`

Migration 012 assigns:

- `invakay@outlook.com` -> NupHub role: `owner`
- `invakay@outlook.com` -> plan: `creator`

At the bottom of the migration, the verification query should return the account with:

- `admin_role = owner`
- `plan = creator`

## 2. Vercel server environment

The Admin users endpoint uses the existing server-side Supabase variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role key as a `VITE_` variable.

## 3. Admin UI

After migration 012 is applied and you sign back in, the dashboard sidebar shows:

- Admin

Route:

- `/dashboard/admin/users`

The page lists only accounts with a NupHub profile, even though Supabase Auth is shared with other OneTime Labs apps.

You can set each NupHub user to:

- Free
- Pro
- Creator

The plan update goes through `/api/admin/users` and the server verifies the caller exists in `public.nuphub_admins` before using the Supabase service-role client.

## 4. Owner account display

`/dashboard/account` shows the signed-in account's current plan and admin role. After migration 012, your account should display:

- Creator 
- Owner

## 5. Build

Run:

```powershell
npm install
npm run build
```
