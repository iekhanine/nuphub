NupHub product / monetization build

WHAT THIS BUILD ADDS
- Redesigned dashboard overview.
- Links moved to /dashboard/links.
- Public /pricing page.
- Dashboard /dashboard/billing page.
- Free / Pro  / Creator  tiers.
- Existing NupHub profiles are grandfathered into Creator .
- New profiles default to Free.
- Free link limit is enforced server-side at 5 links.
- Square hosted checkout for Pro ($29 one time) and Creator ($69 one time).
- Signed Square payment.updated webhook upgrades the NupHub entitlement.
- Square checkout uses only two Vercel functions:
  api/square/create-checkout.js
  api/square/webhook.js

INSTALL
1. Run existing NupHub migrations through 010 if you have not already.
2. Run:
   sql/011_nuphub_product_tiers_square.sql

3. In Vercel, add server environment variables:
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
   SQUARE_ENVIRONMENT=production
   SQUARE_ACCESS_TOKEN
   SQUARE_LOCATION_ID
   SQUARE_WEBHOOK_SIGNATURE_KEY
   SQUARE_WEBHOOK_URL=https://nuphub.com/api/square/webhook
   SITE_URL=https://nuphub.com

Keep the existing browser variables:
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_SITE_URL=https://nuphub.com

4. In Square Developer Console, create a webhook subscription:
   URL:
   https://nuphub.com/api/square/webhook

   Event:
   payment.updated

5. Copy the webhook Signature Key into:
   SQUARE_WEBHOOK_SIGNATURE_KEY

6. Deploy, then test checkout first in Square Sandbox.
   Change SQUARE_ENVIRONMENT to production only after sandbox succeeds.

IMPORTANT
- SUPABASE_SERVICE_ROLE_KEY and SQUARE_ACCESS_TOKEN are server-only secrets.
- Never put either into a VITE_ environment variable.
- The webhook verifies Square's x-square-hmacsha256-signature.
- Existing beta profiles are intentionally Creator  so current testing
  does not suddenly lock features.

TIER MODEL
Free
- $0
- 5 links
- generated short URLs
- OBS source
- basic overlay functionality
- public profile

Pro 
- $29 once
- unlimited links
- full overlay builder
-  access

Creator 
- $69 once
- everything in Pro
- entitlement for Creator-level features as they ship
- intended home for advanced analytics, presets, scheduling, Twitch tools,
  campaigns, custom domains and team/mod access

The checkout and entitlements are live product infrastructure.
The later Creator feature families are intentionally represented as entitlement
scope, not fake controls that pretend to work before they are implemented.
