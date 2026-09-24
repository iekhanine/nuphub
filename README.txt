NupHub overlay color controls

1. Run:
   sql/010_overlay_color_controls.sql

2. Replace:
   src/types.ts
   src/lib/data.ts
   src/components/OverlayRenderer.tsx
   src/pages/OverlaySettingsPage.tsx

3. Run:
   npm run build

New controls:
- Text color
- Background color
- Background opacity slider
- Accent color remains independent

The background opacity applies only to the pill background.
Text and accent bar remain fully opaque.

Defaults:
- text_color: #ffffff
- background_color: #0a080e
