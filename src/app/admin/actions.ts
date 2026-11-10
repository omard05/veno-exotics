"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ADMIN_COOKIE, checkPassword, createSessionToken } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { findConflict, saveSettings } from "@/lib/data";
import { isDateStr, formatDate, formatTime } from "@/lib/dates";
import { parseMoney, formatMoney } from "@/lib/money";
import { NOTIFY_EMAIL, renderRows, sendMail } from "@/lib/mail";
import type { GalleryItem, SiteSettings } from "@/lib/site";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const lines = (v: string) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

function done(path: string, msg = "Saved") {
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}notice=${encodeURIComponent(msg)}`);
}
function fail(path: string, msg: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(msg)}`);
}

// --------------------------------------------------------------------------- auth

export async function login(_: { error?: string } | null, fd: FormData) {
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD is not configured on the server." };
  if (!(await checkPassword(s(fd, "password")))) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Incorrect password." };
  }
  const { token, maxAge } = await createSessionToken();
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// --------------------------------------------------------------------------- booking requests

export async function decideBooking(decision: "approved" | "declined" | "cancelled" | "pending", fd: FormData) {
  await requireAdmin();
  const id = Number(s(fd, "id"));
  const note = s(fd, "adminNote");
  const notify = fd.get("notify") === "on";
  const back = `/admin/requests/${id}`;
  if (!["approved", "declined", "cancelled", "pending"].includes(decision)) fail(back, "Invalid action");

  const db = await getDb();
  const [b] = await db.select().from(schema.bookingRequests).where(eq(schema.bookingRequests.id, id));
  if (!b) fail("/admin/requests", "Request not found");

  if (decision === "approved") {
    const conflict = await findConflict(b.vehicleId, b.pickupDate, b.returnDate, b.id);
    if (conflict) fail(back, `Cannot approve: the vehicle is already booked or blocked on ${formatDate(conflict)}.`);
  }

  await db
    .update(schema.bookingRequests)
    .set({ status: decision, adminNote: note, decidedAt: decision === "pending" ? null : new Date() })
    .where(eq(schema.bookingRequests.id, id));

  if (notify && (decision === "approved" || decision === "declined" || decision === "cancelled")) {
    const ref = `VENO-${String(b.id).padStart(5, "0")}`;
    const titles = {
      approved: `Your reservation is confirmed · ${ref}`,
      declined: `Update on your reservation request · ${ref}`,
      cancelled: `Your reservation has been cancelled · ${ref}`,
    } as const;
    const intro = {
      approved: "Your VENO reservation request has been approved. Our team will be in touch with next steps.",
      declined: "Unfortunately we are unable to accommodate this reservation request. Please contact us — we'd be glad to help you find alternative dates or a different vehicle.",
      cancelled: "Your VENO reservation has been cancelled. Please contact us with any questions.",
    } as const;
    const body = renderRows(
      titles[decision],
      [
        ["Vehicle", b.vehicleName],
        ["Pickup", `${formatDate(b.pickupDate)} at ${formatTime(b.pickupTime)}`],
        ["Return", `${formatDate(b.returnDate)} at ${formatTime(b.returnTime)}`],
        ...(decision === "approved" ? [["Estimated rental", formatMoney(b.estimateCents)] as [string, string]] : []),
        ...(note ? [["Message from VENO", note] as [string, string]] : []),
      ],
      `${intro[decision]} Questions? Reply to this email.`,
    );
    await sendMail({ to: b.email, subject: `VENO — ${titles[decision]}`, replyTo: NOTIFY_EMAIL, ...body });
  }

  done(back, `Request ${decision}`);
}

export async function deleteBooking(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.bookingRequests).where(eq(schema.bookingRequests.id, Number(s(fd, "id"))));
  done("/admin/requests", "Request deleted");
}

// --------------------------------------------------------------------------- vehicles

function slugify(v: string) {
  return v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export async function saveVehicle(fd: FormData) {
  await requireAdmin();
  const id = Number(s(fd, "id")) || undefined;
  const back = id ? `/admin/vehicles/${id}` : "/admin/vehicles/new";
  const name = s(fd, "name");
  if (!name) fail(back, "Name is required");
  const price = parseMoney(s(fd, "dailyPrice"));
  const deposit = parseMoney(s(fd, "deposit") || "0");
  const extra = parseMoney(s(fd, "extraMile") || "0");
  const miles = Number(s(fd, "includedMilesPerDay") || "0");
  const minDays = Math.max(1, Number(s(fd, "minDays") || "1"));
  if ([price, deposit, extra].some((n) => isNaN(n)) || !Number.isFinite(miles) || miles < 0) fail(back, "Check the price fields");

  const specs = lines(s(fd, "specs"))
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : null;
    })
    .filter((x): x is { label: string; value: string } => !!x && !!x.label && !!x.value);

  const values = {
    name,
    slug: slugify(s(fd, "slug") || `${name} ${s(fd, "subtitle")}`),
    subtitle: s(fd, "subtitle"),
    category: s(fd, "category"),
    dailyPriceCents: price,
    depositCents: deposit,
    includedMilesPerDay: Math.round(miles),
    extraMileCents: extra,
    minDays: Math.round(minDays),
    description: s(fd, "description"),
    specs,
    images: lines(s(fd, "images")),
    published: fd.get("published") === "on",
    sortOrder: Number(s(fd, "sortOrder") || "0") || 0,
  };

  const db = await getDb();
  try {
    if (id) {
      await db.update(schema.vehicles).set(values).where(eq(schema.vehicles.id, id));
      done(back, "Vehicle saved");
    } else {
      const [row] = await db.insert(schema.vehicles).values(values).returning({ id: schema.vehicles.id });
      done(`/admin/vehicles/${row.id}`, "Vehicle created");
    }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // redirect()
    fail(back, "Could not save — the URL slug may already be in use.");
  }
}

export async function deleteVehicle(fd: FormData) {
  await requireAdmin();
  const id = Number(s(fd, "id"));
  const db = await getDb();
  await db.delete(schema.vehicles).where(eq(schema.vehicles.id, id));
  await db.delete(schema.blockedDates).where(eq(schema.blockedDates.vehicleId, id));
  done("/admin/vehicles", "Vehicle deleted");
}

// --------------------------------------------------------------------------- promotions

export async function savePromotion(fd: FormData) {
  await requireAdmin();
  const id = Number(s(fd, "id")) || undefined;
  const back = "/admin/promotions";
  const price = parseMoney(s(fd, "promoPrice"));
  const startsOn = s(fd, "startsOn");
  const endsOn = s(fd, "endsOn");
  const title = s(fd, "title");
  if (!title) fail(back, "Title is required");
  if (isNaN(price) || price <= 0) fail(back, "Enter a valid promotional price");
  if (!isDateStr(startsOn) || !isDateStr(endsOn) || endsOn < startsOn) fail(back, "Check the promotion dates");
  const vehicleIds = fd.getAll("vehicleIds").map(Number).filter(Boolean);
  if (!vehicleIds.length) fail(back, "Select at least one vehicle");

  const values = {
    title,
    description: s(fd, "description"),
    vehicleIds,
    promoDailyPriceCents: price,
    startsOn,
    endsOn,
    enabled: fd.get("enabled") === "on",
    disclaimer: s(fd, "disclaimer"),
  };
  const db = await getDb();
  if (id) await db.update(schema.promotions).set(values).where(eq(schema.promotions.id, id));
  else await db.insert(schema.promotions).values(values);
  done(back, id ? "Promotion saved" : "Promotion created");
}

export async function deletePromotion(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.promotions).where(eq(schema.promotions.id, Number(s(fd, "id"))));
  done("/admin/promotions", "Promotion deleted");
}

// --------------------------------------------------------------------------- availability

export async function addBlock(fd: FormData) {
  await requireAdmin();
  const back = "/admin/availability";
  const vehicleId = Number(s(fd, "vehicleId"));
  const startDate = s(fd, "startDate");
  const endDate = s(fd, "endDate") || startDate;
  if (!vehicleId) fail(back, "Select a vehicle");
  if (!isDateStr(startDate) || !isDateStr(endDate) || endDate < startDate) fail(back, "Check the dates");
  const db = await getDb();
  await db.insert(schema.blockedDates).values({ vehicleId, startDate, endDate, reason: s(fd, "reason") });
  done(back, "Dates blocked");
}

export async function removeBlock(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.blockedDates).where(eq(schema.blockedDates.id, Number(s(fd, "id"))));
  done("/admin/availability", "Dates reopened");
}

// --------------------------------------------------------------------------- inbox items

const INBOX = {
  consignment: schema.consignmentInquiries,
  brokers: schema.brokerApplications,
  messages: schema.contactMessages,
} as const;

export async function setInboxStatus(status: string, fd: FormData) {
  await requireAdmin();
  const kind = s(fd, "kind") as keyof typeof INBOX;
  const table = INBOX[kind];
  if (!table) fail("/admin", "Invalid item");
  const db = await getDb();
  if (status === "delete") await db.delete(table).where(eq(table.id, Number(s(fd, "id"))));
  else await db.update(table).set({ status }).where(eq(table.id, Number(s(fd, "id"))));
  done(`/admin/${kind}`, status === "delete" ? "Deleted" : "Updated");
}

// --------------------------------------------------------------------------- settings

export async function saveSiteSettings(fd: FormData) {
  await requireAdmin();
  const gallery: GalleryItem[] = lines(s(fd, "gallery")).map((l) => {
    const [src, alt = "", href = ""] = l.split("|").map((x) => x.trim());
    return { src, alt, href: href || undefined };
  });
  const experiences = s(fd, "experiences")
    .split(/\n\s*---+\s*\n/)
    .map((block) => {
      const ls = block.split(/\r?\n/).map((x) => x.trim());
      const title = ls.shift() || "";
      let image: string | undefined;
      if (ls[0]?.toLowerCase().startsWith("image:")) image = ls.shift()!.slice(6).trim() || undefined;
      return { title, body: ls.join(" ").replace(/\s+/g, " ").trim(), image };
    })
    .filter((e) => e.title && e.body);

  const patch: Partial<SiteSettings> = {
    phone: s(fd, "phone"),
    email: s(fd, "email"),
    address: s(fd, "address"),
    hours: s(fd, "hours"),
    website: s(fd, "website"),
    instagramHandle: s(fd, "instagramHandle"),
    instagramUrl: s(fd, "instagramUrl"),
    tiktokHandle: s(fd, "tiktokHandle"),
    tiktokUrl: s(fd, "tiktokUrl"),
    serviceAreas: lines(s(fd, "serviceAreas")),
    heroImage: s(fd, "heroImage"),
    gallery,
    experiences,
    aboutBody: s(fd, "aboutBody"),
  };
  await saveSettings(patch);
  done("/admin/settings", "Settings saved");
}
