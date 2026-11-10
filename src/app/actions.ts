"use server";

import { z } from "zod";
import { getDb, schema } from "@/db";
import { findConflict, getVehicle, listPromotions } from "@/lib/data";
import { estimate } from "@/lib/pricing";
import { formatDate, formatTime, isDateStr, isTimeStr, todayLA, addDays } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { NOTIFY_EMAIL, SITE_URL, renderRows, sendMail } from "@/lib/mail";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; ref?: string } | null;

const str = (max = 500) => z.string().trim().max(max);
const required = (label: string, max = 200) => str(max).min(1, `${label} is required`);
const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
const phone = z
  .string()
  .trim()
  .refine((s) => s.replace(/\D/g, "").length >= 10, "Enter a valid phone number")
  .pipe(z.string().max(40));

function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

/** Simple bot trap: real visitors never fill the hidden "company_website" field. */
function isBot(fd: FormData) {
  return Boolean(fd.get("company_website"));
}

// ---------------------------------------------------------------------------
// Booking request
// ---------------------------------------------------------------------------

const BookingSchema = z.object({
  vehicleId: z.coerce.number().int().positive("Select a vehicle"),
  pickupDate: z.string().refine(isDateStr, "Choose a pickup date"),
  pickupTime: z.string().refine(isTimeStr, "Choose a pickup time"),
  returnDate: z.string().refine(isDateStr, "Choose a return date"),
  returnTime: z.string().refine(isTimeStr, "Choose a return time"),
  fullName: required("Full name", 120),
  email,
  phone,
  notes: str(2000).default(""),
  agree: z.literal("on", { message: "Please acknowledge the request terms" }),
});

export async function submitBookingRequest(_: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return { ok: true, message: "Request received." };
  const parsed = BookingSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: "Please review the highlighted fields.", errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const vehicle = await getVehicle(d.vehicleId);
  if (!vehicle || !vehicle.published) return { ok: false, message: "This vehicle is not available to book.", errors: { vehicleId: "Select a vehicle" } };

  const today = todayLA();
  if (d.pickupDate < today) return { ok: false, message: "Pickup date cannot be in the past.", errors: { pickupDate: "Choose a future date" } };
  if (d.pickupDate > addDays(today, 730)) return { ok: false, message: "Please choose a pickup date within the next two years.", errors: { pickupDate: "Too far ahead" } };

  const promos = await listPromotions();
  const est = estimate(vehicle, promos, d.pickupDate, d.pickupTime, d.returnDate, d.returnTime, today);
  if (!est) return { ok: false, message: "Return must be after pickup.", errors: { returnDate: "Return must be after pickup" } };
  if (est.days < vehicle.minDays)
    return { ok: false, message: `This vehicle has a ${vehicle.minDays}-day minimum rental.`, errors: { returnDate: `Minimum ${vehicle.minDays} days` } };

  const conflict = await findConflict(vehicle.id, d.pickupDate, d.returnDate);
  if (conflict)
    return {
      ok: false,
      message: `The ${vehicle.name} is already reserved on ${formatDate(conflict)}. Please choose different dates.`,
      errors: { pickupDate: "Dates unavailable" },
    };

  const db = await getDb();
  const [row] = await db
    .insert(schema.bookingRequests)
    .values({
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.name}${vehicle.subtitle && !vehicle.name.includes(vehicle.subtitle) ? ` ${vehicle.subtitle}` : ""}`,
      pickupDate: d.pickupDate,
      pickupTime: d.pickupTime,
      returnDate: d.returnDate,
      returnTime: d.returnTime,
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      notes: d.notes,
      rentalDays: est.billedDays,
      estimateCents: est.subtotalCents,
      estimate: est,
      status: "pending",
    })
    .returning();

  const ref = `VENO-${String(row.id).padStart(5, "0")}`;
  const rows: [string, string][] = [
    ["Reference", ref],
    ["Vehicle", row.vehicleName],
    ["Pickup", `${formatDate(d.pickupDate)} at ${formatTime(d.pickupTime)}`],
    ["Return", `${formatDate(d.returnDate)} at ${formatTime(d.returnTime)}`],
    ["Rental days", String(est.billedDays)],
    ...est.lines.map((l) => [l.label, `${l.days} × ${formatMoney(l.rateCents)} = ${formatMoney(l.amountCents)}`] as [string, string]),
    ["Estimated rental", formatMoney(est.subtotalCents)],
    ["Included mileage", `${est.includedMiles} miles (${formatMoney(est.extraMileCents)}/mile after)`],
    ["Security deposit", formatMoney(est.depositCents)],
  ];
  const customerRows: [string, string][] = [["Name", d.fullName], ["Email", d.email], ["Phone", d.phone], ...(d.notes ? [["Notes", d.notes] as [string, string]] : [])];

  const biz = renderRows(`New reservation request · ${ref}`, [...customerRows, ...rows], `Approve or decline in the admin dashboard: ${SITE_URL}/admin/requests/${row.id}`);
  const cust = renderRows(
    `We received your reservation request · ${ref}`,
    rows,
    "Thank you for choosing VENO. This is a request, not a confirmed reservation. Our team will review availability and contact you to confirm. Pricing shown is an estimate and excludes any applicable taxes and fees.",
  );

  await Promise.all([
    sendMail({ to: NOTIFY_EMAIL, subject: `New Reservation Request ${ref} — ${row.vehicleName}`, replyTo: d.email, ...biz }),
    sendMail({ to: d.email, subject: `VENO — Reservation request received (${ref})`, replyTo: NOTIFY_EMAIL, ...cust }),
  ]);

  return { ok: true, message: "Your reservation request has been received.", ref };
}

// ---------------------------------------------------------------------------
// Consignment
// ---------------------------------------------------------------------------

const ConsignmentSchema = z.object({
  ownerName: required("Name", 120),
  email,
  phone,
  vehicleYear: required("Year", 10),
  vehicleMake: required("Make", 60),
  vehicleModel: required("Model", 80),
  trim: str(80).default(""),
  mileage: str(40).default(""),
  exteriorColor: str(60).default(""),
  vin: str(40).default(""),
  location: str(120).default(""),
  photosLink: str(500).default(""),
  notes: str(3000).default(""),
});

export async function submitConsignment(_: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return { ok: true, message: "Received." };
  const parsed = ConsignmentSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: "Please review the highlighted fields.", errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const db = await getDb();
  const [row] = await db.insert(schema.consignmentInquiries).values(d).returning();

  const mail = renderRows(`New consignment inquiry #${row.id}`, [
    ["Owner", d.ownerName], ["Email", d.email], ["Phone", d.phone],
    ["Vehicle", `${d.vehicleYear} ${d.vehicleMake} ${d.vehicleModel} ${d.trim}`.trim()],
    ["Mileage", d.mileage], ["Exterior color", d.exteriorColor], ["VIN", d.vin], ["Location", d.location],
    ["Photos", d.photosLink], ["Notes", d.notes],
  ].filter(([, v]) => v) as [string, string][], `${SITE_URL}/admin/consignment`);
  await sendMail({ to: NOTIFY_EMAIL, subject: `Consignment Inquiry — ${d.vehicleYear} ${d.vehicleMake} ${d.vehicleModel}`, replyTo: d.email, ...mail });

  return { ok: true, message: "Thank you. Your vehicle has been submitted for consideration — our team will review the details and be in touch." };
}

// ---------------------------------------------------------------------------
// Broker / referral partner application
// ---------------------------------------------------------------------------

const BrokerSchema = z.object({
  fullName: required("Full name", 120),
  email,
  phone,
  company: str(120).default(""),
  social: str(200).default(""),
  location: str(120).default(""),
  network: required("Tell us about your network", 3000),
  notes: str(3000).default(""),
});

export async function submitBrokerApplication(_: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return { ok: true, message: "Received." };
  const parsed = BrokerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: "Please review the highlighted fields.", errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const db = await getDb();
  const [row] = await db.insert(schema.brokerApplications).values(d).returning();

  const mail = renderRows(`New broker application #${row.id}`, [
    ["Name", d.fullName], ["Email", d.email], ["Phone", d.phone], ["Company", d.company],
    ["Social", d.social], ["Location", d.location], ["Network", d.network], ["Notes", d.notes],
  ].filter(([, v]) => v) as [string, string][], `${SITE_URL}/admin/brokers`);
  await sendMail({ to: NOTIFY_EMAIL, subject: `Broker Application — ${d.fullName}`, replyTo: d.email, ...mail });

  return { ok: true, message: "Thank you for applying. Our team will review your application and contact you." };
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

const ContactSchema = z.object({
  fullName: required("Name", 120),
  email,
  phone: str(40).default(""),
  message: required("Message", 4000),
});

export async function submitContact(_: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return { ok: true, message: "Received." };
  const parsed = ContactSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: "Please review the highlighted fields.", errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const db = await getDb();
  await db.insert(schema.contactMessages).values(d);
  const mail = renderRows("New website message", [["Name", d.fullName], ["Email", d.email], ["Phone", d.phone], ["Message", d.message]].filter(([, v]) => v) as [string, string][]);
  await sendMail({ to: NOTIFY_EMAIL, subject: `Website Message — ${d.fullName}`, replyTo: d.email, ...mail });
  return { ok: true, message: "Thank you — your message has been sent. We'll be in touch shortly." };
}
