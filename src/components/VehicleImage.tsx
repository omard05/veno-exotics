import { PhotoSlot } from "./PhotoSlot";
import { PHOTOS, VEHICLE_SLOTS } from "@/lib/photos";

/**
 * Vehicle photo. Uses (in order): the photo passed in (from the admin dashboard),
 * then the vehicle's numbered slot in src/lib/photos.ts, else a numbered blank box.
 */
export function VehicleImage({
  src,
  slug,
  name,
  className = "",
  priority = false,
}: {
  src?: string;
  slug?: string;
  name: string;
  subtitle?: string;
  className?: string;
  priority?: boolean;
}) {
  const slot = slug ? VEHICLE_SLOTS[slug] : undefined;
  return (
    <PhotoSlot
      slot={slot}
      src={src || (slot ? PHOTOS[slot] : "")}
      label={name}
      className={className}
      priority={priority}
    />
  );
}
