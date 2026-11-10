/** Brand constants and default (editable) site content. */

export const BRAND = {
  name: "VENO",
  fullName: "VENO Exotic Car Rentals",
  tagline: "NOT YOUR AVERAGE RENTAL.",
  supportingTagline: "Where Luxury Meets Performance.",
};

export const PROMO_DISCLAIMER =
  "Promotional offers are subject to vehicle availability and applicable rental terms. Offers cannot be combined with other promotions or applied retroactively to existing reservations.";

export type GalleryItem = { src: string; alt: string; href?: string };

export type SiteSettings = {
  phone: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  address: string;
  hours: string;
  website: string;
  serviceAreas: string[];
  heroImage: string;
  gallery: GalleryItem[];
  experiences: { title: string; body: string; image?: string }[];
  aboutBody: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "703-953-5208",
  email: "kareemdarwish001@gmail.com",
  instagramHandle: "@veno.exotics",
  instagramUrl: "https://www.instagram.com/veno.exotics/",
  tiktokHandle: "@veno.exotics",
  tiktokUrl: "https://www.tiktok.com/@veno.exotics",
  address: "4590 MacArthur Boulevard, Newport Beach, CA 92660",
  hours: "Monday–Sunday, 24 hours",
  website: "venoexotics.com",
  serviceAreas: ["Newport Beach", "Orange County", "Los Angeles"],
  heroImage: "",
  gallery: [],
  experiences: [
    {
      title: "The Coastal Drive",
      body: "Take the wheel along the Southern California coastline, from Newport Beach through Orange County and up toward Los Angeles.",
    },
    {
      title: "Special Occasions",
      body: "Birthdays, anniversaries, proposals and celebrations. Arrive in a vehicle that matches the moment.",
    },
    {
      title: "Business & Arrivals",
      body: "Meetings, events and visits to Orange County or Los Angeles, made with a statement vehicle.",
    },
    {
      title: "The Weekend Escape",
      body: "Book a multi-day rental and make the weekend about the drive.",
    },
  ],
  aboutBody:
    "VENO Exotic Car Rentals is a luxury and exotic vehicle rental company based in Newport Beach, California, serving Newport Beach, Orange County and Los Angeles. We curate a select fleet of ultra-luxury and high-performance vehicles and handle every reservation personally — each request is reviewed by our team before it is confirmed.",
};
