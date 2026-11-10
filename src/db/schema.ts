import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * All money values are stored in whole US cents.
 * Calendar dates are stored as "YYYY-MM-DD" text and times as "HH:MM" text,
 * both interpreted in Newport Beach local time (America/Los_Angeles).
 */

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  category: text("category").notNull().default(""),
  dailyPriceCents: integer("daily_price_cents").notNull(),
  depositCents: integer("deposit_cents").notNull().default(0),
  includedMilesPerDay: integer("included_miles_per_day").notNull().default(100),
  extraMileCents: integer("extra_mile_cents").notNull().default(0),
  minDays: integer("min_days").notNull().default(1),
  description: text("description").notNull().default(""),
  /** Admin-entered specifications, e.g. [{label:"Seats", value:"4"}]. Never pre-filled. */
  specs: jsonb("specs").$type<{ label: string; value: string }[]>().notNull().default([]),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  vehicleIds: jsonb("vehicle_ids").$type<number[]>().notNull().default([]),
  promoDailyPriceCents: integer("promo_daily_price_cents").notNull(),
  startsOn: text("starts_on").notNull(), // inclusive, YYYY-MM-DD
  endsOn: text("ends_on").notNull(), // inclusive, YYYY-MM-DD
  enabled: boolean("enabled").notNull().default(true),
  disclaimer: text("disclaimer").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BookingStatus = "pending" | "approved" | "declined" | "cancelled";

export const bookingRequests = pgTable("booking_requests", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  vehicleName: text("vehicle_name").notNull(),
  pickupDate: text("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  returnDate: text("return_date").notNull(),
  returnTime: text("return_time").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes").notNull().default(""),
  rentalDays: integer("rental_days").notNull(),
  estimateCents: integer("estimate_cents").notNull(),
  estimate: jsonb("estimate").notNull(),
  status: text("status").$type<BookingStatus>().notNull().default("pending"),
  adminNote: text("admin_note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

/** Dates an administrator has manually closed (maintenance, private use, etc.). */
export const blockedDates = pgTable("blocked_dates", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const consignmentInquiries = pgTable("consignment_inquiries", {
  id: serial("id").primaryKey(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  vehicleYear: text("vehicle_year").notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  trim: text("trim").notNull().default(""),
  mileage: text("mileage").notNull().default(""),
  exteriorColor: text("exterior_color").notNull().default(""),
  vin: text("vin").notNull().default(""),
  location: text("location").notNull().default(""),
  photosLink: text("photos_link").notNull().default(""),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const brokerApplications = pgTable("broker_applications", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull().default(""),
  social: text("social").notNull().default(""),
  location: text("location").notNull().default(""),
  network: text("network").notNull().default(""),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type BlockedDate = typeof blockedDates.$inferSelect;
