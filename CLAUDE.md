# VENO Exotic Car Rentals — notes for Claude

Website for VENO Exotic Car Rentals (Newport Beach, CA; serves Newport Beach, Orange County, Los Angeles).
Next.js 15 App Router + React 19 + Tailwind CSS 4 + Drizzle ORM (Postgres; embedded PGlite in ./.data when DATABASE_URL is unset).

## Run
- `npm run dev` → http://localhost:3000, admin at /admin (password from ADMIN_PASSWORD in .env.local)
- `npm run build` must pass before pushing; `npm run check:pricing` checks pricing/promo logic.

## Where things live
- Public pages: `src/app/(site)/…`; admin dashboard: `src/app/admin/…`; form handlers: `src/app/actions.ts`, `src/app/admin/actions.ts`
- Styles and fonts: `src/app/globals.css` (Montserrat headings/labels, Inter body; black & white palette)
- Photo spots: numbered gray boxes C1–C19, configured in `src/lib/photos.ts`, mapped in `PHOTOS.md`.
  When the owner sends a photo for a slot, save it to `public/images/` and set the path in `src/lib/photos.ts`.
- Default site text (Experiences, About, contact info): `src/lib/site.ts` (also editable in Admin → Site Settings)
- Seed fleet and November promotion: `src/db/seed.ts`

## Business rules — do not break
- Never invent vehicle specs, customer reviews/testimonials, years in business/company history,
  insurance coverage, guarantees, broker commission rates, or services that aren't confirmed.
- Booking is REQUEST-TO-BOOK: never auto-confirm. Dates become unavailable only after admin approval (or admin block).
- Promotions show only between their start/end dates (America/Los_Angeles) and must disappear automatically after.
- Prices, promotions, vehicles and availability must stay editable from the admin dashboard.

## Owner
Not a developer — explain changes in plain language, and show how to view them (the dev server reloads automatically).
