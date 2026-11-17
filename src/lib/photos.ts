/**
 * PHOTO SLOTS
 * -----------
 * Every place on the website that will show a car photo has a number (C1, C2, …).
 * Until a photo is added, the site shows a blank box with that number on it.
 *
 * To add a photo:
 *   1. Put the image file in  public/images/  (e.g. public/images/c1.jpg)
 *   2. Type its path next to the slot below, e.g.  C1: "/images/c1.jpg",
 *   3. Save. The blank box is replaced by the photo.
 *
 * Wide, landscape photos (at least 2000px wide) look best for backgrounds.
 */
export const PHOTOS = {
  // Home page
  C1: "", // Home — main full-screen background (top of the page)
  C2: "", // Mercedes-Maybach GLS 600 — main photo (home, fleet, vehicle page)
  C3: "", // BMW M3 (G80) — main photo (home, fleet, specials, vehicle page)
  C4: "", // BMW M4 (G82) — main photo (home, fleet, specials, vehicle page)
  C5: "", // Home — November offer banner background
  C6: "", // Home — "Every reservation, personally reviewed" section background
  C7: "", // Home — bottom "Your next drive starts here" background

  // Page header backgrounds
  C8: "", // Specials page — header background
  C9: "", // Our Fleet page — header background
  C10: "", // Experiences page — header background
  C11: "", // Consignment page — header background
  C12: "", // Brokers page — header background
  C13: "", // About Us page — header background
  C14: "", // Contact page — header background
  C15: "", // Reserve / booking page — header background

  // Experiences page (one per experience, in order)
  C16: "", // Experience 1 — The Coastal Drive
  C17: "", // Experience 2 — Special Occasions
  C18: "", // Experience 3 — Business & Arrivals
  C19: "", // Experience 4 — The Weekend Escape
} as const;

export type SlotId = keyof typeof PHOTOS;

/** Which slot holds each vehicle's main photo (by the vehicle's URL slug). */
export const VEHICLE_SLOTS: Record<string, SlotId> = {
  "mercedes-maybach-gls-600": "C2",
  "bmw-m3-g80": "C3",
  "bmw-m4-g82": "C4",
};

export const EXPERIENCE_SLOTS: SlotId[] = ["C16", "C17", "C18", "C19"];
