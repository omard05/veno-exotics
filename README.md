# VENO Exotic Car Rentals

**NOT YOUR AVERAGE RENTAL.** — *Where Luxury Meets Performance.*

Website, request-to-book system and administrator dashboard for VENO Exotic Car Rentals,
Newport Beach, CA, serving Newport Beach, Orange County and Los Angeles.

Built with Next.js 15 (App Router), React 19, Tailwind CSS 4, Drizzle ORM and Postgres.

---

## What's included

| Area | Details |
| --- | --- |
| **Public site** | Home, Specials, Our Fleet (+ vehicle detail pages), Experiences, Consignment, Brokers, About Us, Contact. The VENO logo links home. Responsive desktop and mobile layouts. |
| **Request-to-book** | Choose a vehicle → pickup/return dates (availability calendar) and times → contact info → review the estimate → submit. Reservations are **never confirmed automatically**. |
| **Notifications** | Each request is saved and emailed to `NOTIFY_EMAIL` (kareemdarwish001@gmail.com). The customer gets an acknowledgement saying it is a request, not a confirmation. |
| **Admin dashboard** (`/admin`) | Approve or decline requests (optionally emailing the customer), edit vehicles, prices, deposits and mileage, manage photos, create and schedule promotions, block dates, review consignment, broker and contact submissions, and edit contact info, social links, gallery, Experiences and About content. |
| **Availability** | Dates are marked booked **only after an admin approves a request**, or when an admin blocks them. Pending requests never block the calendar. Overlapping requests are rejected, and approval is refused if it would double-book. |
| **November promotion** | BMW M3 (G80) and M4 (G82) at $399/day, with the regular $495 price crossed out, plus the promotional disclaimer. It shows only from Nov 1 to Nov 30 (Newport Beach time) and **disappears automatically** on Dec 1. The Maybach stays at $695. |

### Content rules followed
No invented vehicle specs, reviews, testimonials, company history, insurance coverage, guarantees,
commission rates or unconfirmed services. The specifications section on a vehicle page appears only
after you enter verified specs in the dashboard. Until photos are added, each vehicle shows a styled
"Photography coming soon" panel instead of stock images of other cars.

---

## Run locally

```bash
npm install
cp .env.example .env.local     # then set ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin.
Without `DATABASE_URL`, an embedded Postgres database is created automatically in `./.data`.
Tables and the initial fleet and November promotion are created on first start.

`npm run check:pricing` runs the pricing and promotion-expiry checks.

## Deploy (recommended: Vercel + Neon Postgres)

1. Import this repository at https://vercel.com/new.
2. Add a Postgres database (Vercel Storage → Neon, or https://neon.tech) and set `DATABASE_URL`.
3. Set the environment variables below, then deploy.
4. Point the `venoexotics.com` domain to the Vercel project.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (required in production) |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | Random string (`openssl rand -hex 32`) |
| `NOTIFY_EMAIL` | Where requests go (default kareemdarwish001@gmail.com) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Outgoing email. For Gmail: `smtp.gmail.com`, `465`, the Gmail address and a Google **App Password** |
| `MAIL_FROM` | Sender name and address |
| `SITE_URL` | `https://venoexotics.com` (used in email links) |

If SMTP is not configured, every submission is still saved in the dashboard. The email is written to
the server log instead of being sent.

## Managing the site

- **Prices, deposits, mileage, minimum days:** Admin → Vehicles & Pricing.
- **Photos:** paste image URLs, one per line; the first is the main photo. You can also commit
  files to `public/images/fleet/` and reference them as `/images/fleet/name.jpg`. Use wide,
  high-resolution landscape shots.
- **Promotions:** Admin → Promotions. Set the price, the vehicles, and first and last days. A promotion is
  live only within its dates, so next November just needs new dates (or a new promotion).
- **Instagram / TikTok gallery:** Admin → Site Settings → Gallery. The gallery section appears only once images are added.
- **Hero image:** Admin → Site Settings. If left empty, the site uses the first vehicle photo.

## Pricing logic
Each started 24-hour period is one rental day, never below the vehicle's minimum. Each rental day is priced
by its own date: days inside a live promotion use the promo rate, and the rest use the regular rate.
Included miles = days × miles per day. Estimates exclude taxes and fees. Final pricing is confirmed by
VENO on approval.
