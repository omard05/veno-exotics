"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { submitBookingRequest, type FormState } from "@/app/actions";
import { estimate, type PricingPromotion, type PricingVehicle } from "@/lib/pricing";
import { eachDate, formatDate, formatTime, TIME_SLOTS } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { Honeypot, Submit, FormMessage, SuccessPanel } from "@/components/Form";
import { ArrowIcon } from "@/components/Icons";

export type BookingVehicle = PricingVehicle & {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  promoDailyPriceCents?: number;
  promoTitle?: string;
};

type Props = {
  vehicles: BookingVehicle[];
  promos: PricingPromotion[];
  unavailable: Record<number, string[]>;
  today: string;
  initialSlug?: string;
  disclaimer?: string;
};

const STEPS = ["Vehicle & Dates", "Your Details", "Review & Submit"];

export function BookingForm({ vehicles, promos, unavailable, today, initialSlug, disclaimer }: Props) {
  const [state, action] = useActionState<FormState, FormData>(submitBookingRequest, null);
  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState<number | undefined>(vehicles.find((v) => v.slug === initialSlug)?.id ?? (vehicles.length === 1 ? vehicles[0].id : undefined));
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [contact, setContact] = useState({ fullName: "", email: "", phone: "", notes: "" });
  const [localError, setLocalError] = useState("");

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const taken = useMemo(() => new Set(vehicleId ? unavailable[vehicleId] ?? [] : []), [vehicleId, unavailable]);

  const est = useMemo(
    () => (vehicle && pickupDate && returnDate ? estimate(vehicle, promos, pickupDate, pickupTime, returnDate, returnTime, today) : null),
    [vehicle, promos, pickupDate, pickupTime, returnDate, returnTime, today],
  );

  const conflict = pickupDate && returnDate && returnDate >= pickupDate ? eachDate(pickupDate, returnDate).find((d) => taken.has(d)) : undefined;

  function pick(d: string) {
    setLocalError("");
    if (!pickupDate || returnDate || d < pickupDate) {
      setPickupDate(d);
      setReturnDate("");
    } else {
      setReturnDate(d);
    }
  }

  function validateStep(s: number): string {
    if (s === 0) {
      if (!vehicle) return "Please select a vehicle.";
      if (!pickupDate || !returnDate) return "Please choose your pickup and return dates.";
      if (pickupDate < today) return "Pickup date cannot be in the past.";
      if (!est) return "Return must be after pickup.";
      if (est.days < vehicle.minDays) return `This vehicle has a ${vehicle.minDays}-day minimum rental.`;
      if (conflict) return `The selected vehicle is already reserved on ${formatDate(conflict)}. Please choose different dates.`;
    }
    if (s === 1) {
      if (!contact.fullName.trim()) return "Please enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(contact.email)) return "Please enter a valid email address.";
      if (contact.phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number.";
    }
    return "";
  }

  function next() {
    const err = validateStep(step);
    setLocalError(err);
    if (!err) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (state?.ok) {
    return (
      <SuccessPanel
        title="Request received."
        message={`Thank you, ${contact.fullName.split(" ")[0] || "and welcome"}. Your reservation request${state.ref ? ` (${state.ref})` : ""} has been sent to the VENO team. This is not yet a confirmed reservation — we will review availability and contact you to confirm. A copy of your request has been emailed to ${contact.email}.`}
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/fleet" className="btn-ghost">Back to the Fleet</Link>
          <Link href="/" className="btn-ghost">Home</Link>
        </div>
      </SuccessPanel>
    );
  }

  return (
    <form action={action} className="relative">
      <Honeypot />
      {/* All values are always submitted, whichever step is visible. */}
      <input type="hidden" name="vehicleId" value={vehicleId ?? ""} />
      <input type="hidden" name="pickupDate" value={pickupDate} />
      <input type="hidden" name="returnDate" value={returnDate} />
      <input type="hidden" name="pickupTime" value={pickupTime} />
      <input type="hidden" name="returnTime" value={returnTime} />
      <input type="hidden" name="fullName" value={contact.fullName} />
      <input type="hidden" name="email" value={contact.email} />
      <input type="hidden" name="phone" value={contact.phone} />
      <input type="hidden" name="notes" value={contact.notes} />

      <ol className="mb-12 grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={`w-full border-t pt-4 text-left transition-colors ${i <= step ? "border-white" : "border-white/15"} disabled:cursor-default`}
            >
              <span className="font-wide text-[9px] tracking-[0.3em] text-mist">0{i + 1}</span>
              <span className={`mt-1 block text-xs sm:text-sm ${i === step ? "text-white" : "text-mist"}`}>{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* STEP 1 */}
          {step === 0 && (
            <div className="space-y-12">
              <fieldset>
                <legend className="eyebrow mb-5">1 · Select a vehicle</legend>
                <div className="grid gap-3">
                  {vehicles.map((v) => (
                    <label
                      key={v.id}
                      className={`flex cursor-pointer items-center justify-between gap-4 border p-5 transition-colors ${vehicleId === v.id ? "border-white bg-white/[0.04]" : "border-white/15 hover:border-white/40"}`}
                    >
                      <input type="radio" className="sr-only" checked={vehicleId === v.id} onChange={() => { setVehicleId(v.id); setLocalError(""); }} />
                      <span>
                        <span className="eyebrow block">{v.category}</span>
                        <span className="h-display mt-1 block text-2xl md:text-3xl">
                          {v.name} {v.subtitle && !v.name.includes(v.subtitle) && <span className="text-mist">{v.subtitle}</span>}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        {v.promoDailyPriceCents ? (
                          <>
                            <span className="h-display text-2xl">{formatMoney(v.promoDailyPriceCents)}</span>{" "}
                            <s className="text-sm text-mist">{formatMoney(v.dailyPriceCents)}</s>
                          </>
                        ) : (
                          <span className="h-display text-2xl">{formatMoney(v.dailyPriceCents)}</span>
                        )}
                        <span className="block text-[10px] tracking-widest text-mist">/ DAY</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset disabled={!vehicle} className="disabled:opacity-30">
                <legend className="eyebrow mb-5">2 · Choose dates</legend>
                <AvailabilityCalendar today={today} unavailable={[...taken]} start={pickupDate} end={returnDate} onPick={pick} />
                <p className="mt-3 text-xs text-mist">Tap your pickup date, then your return date.</p>
                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="field-label" htmlFor="pd">Pickup date</label>
                      <input id="pd" type="date" min={today} value={pickupDate} onChange={(e) => { setPickupDate(e.target.value); if (returnDate && e.target.value > returnDate) setReturnDate(""); }} className="field" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="pt">Pickup time</label>
                      <select id="pt" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="field">
                        {TIME_SLOTS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="field-label" htmlFor="rd">Return date</label>
                      <input id="rd" type="date" min={pickupDate || today} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="field" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="rt">Return time</label>
                      <select id="rt" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="field">
                        {TIME_SLOTS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <fieldset className="space-y-8">
              <legend className="eyebrow mb-5">3 · Your contact information</legend>
              {(
                [
                  ["fullName", "Full name", "text", "name"],
                  ["email", "Email", "email", "email"],
                  ["phone", "Phone", "tel", "tel"],
                ] as const
              ).map(([k, label, type, ac]) => (
                <div key={k}>
                  <label className="field-label" htmlFor={`c-${k}`}>{label} <span className="text-white">*</span></label>
                  <input id={`c-${k}`} type={type} autoComplete={ac} value={contact[k]} onChange={(e) => setContact({ ...contact, [k]: e.target.value })} className="field" required />
                  {state?.errors?.[k] && <p className="mt-1 text-xs text-red-300">{state.errors[k]}</p>}
                </div>
              ))}
              <div>
                <label className="field-label" htmlFor="c-notes">Notes or special requests (optional)</label>
                <textarea id="c-notes" rows={4} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} className="field resize-y" />
              </div>
            </fieldset>
          )}

          {/* STEP 3 */}
          {step === 2 && vehicle && est && (
            <div className="space-y-10">
              <div>
                <p className="eyebrow mb-4">Review your request</p>
                <dl className="divide-y divide-white/10 border-y border-white/10 text-sm">
                  {[
                    ["Vehicle", `${vehicle.name}${vehicle.subtitle && !vehicle.name.includes(vehicle.subtitle) ? ` ${vehicle.subtitle}` : ""}`],
                    ["Pickup", `${formatDate(pickupDate)} · ${formatTime(pickupTime)}`],
                    ["Return", `${formatDate(returnDate)} · ${formatTime(returnTime)}`],
                    ["Name", contact.fullName],
                    ["Email", contact.email],
                    ["Phone", contact.phone],
                    ...(contact.notes ? [["Notes", contact.notes]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-3">
                      <dt className="text-mist">{k}</dt>
                      <dd className="text-right break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <label className="flex cursor-pointer items-start gap-4 text-sm text-silver">
                <input type="checkbox" name="agree" required className="mt-1 h-4 w-4 accent-white" />
                <span>
                  I understand this is a reservation <strong className="text-white">request</strong>, not a confirmed booking. VENO will review my request and contact me to confirm availability and final pricing. Rentals are subject to VENO&apos;s rental terms.
                </span>
              </label>
              {state?.errors?.agree && <p className="text-xs text-red-300">{state.errors.agree}</p>}
            </div>
          )}

          {(localError || (state && !state.ok)) && (
            <div className="mt-8">
              {localError ? <p role="alert" className="border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{localError}</p> : <FormMessage state={state} />}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">Back</button>
            ) : <span />}
            {step < 2 ? (
              <button type="button" onClick={next} className="btn-light">Continue <ArrowIcon /></button>
            ) : (
              <Submit pendingText="Submitting…">Submit Request <ArrowIcon /></Submit>
            )}
          </div>
        </div>

        {/* ESTIMATE */}
        <aside className="lg:col-span-5">
          <div className="border border-white/15 p-7 lg:sticky lg:top-28">
            <p className="eyebrow">Estimated pricing</p>
            {!vehicle ? (
              <p className="mt-6 text-sm text-mist">Select a vehicle and dates to see your estimate.</p>
            ) : (
              <>
                <p className="h-display mt-4 text-3xl">{vehicle.name} {vehicle.subtitle && !vehicle.name.includes(vehicle.subtitle) && <span className="text-mist">{vehicle.subtitle}</span>}</p>
                {!est ? (
                  <p className="mt-6 text-sm text-mist">Choose pickup and return dates to calculate.</p>
                ) : (
                  <>
                    <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
                      {est.lines.map((l) => (
                        <div key={l.label} className="flex justify-between gap-4 py-3">
                          <dt className="text-silver">{l.label} <span className="text-mist">· {l.days} × {formatMoney(l.rateCents)}</span></dt>
                          <dd>{formatMoney(l.amountCents)}</dd>
                        </div>
                      ))}
                      {est.savingsCents > 0 && (
                        <div className="flex justify-between gap-4 py-3 text-white">
                          <dt>You save</dt>
                          <dd>−{formatMoney(est.savingsCents)}</dd>
                        </div>
                      )}
                      <div className="flex items-baseline justify-between gap-4 py-4">
                        <dt className="eyebrow !text-white">Estimated rental · {est.billedDays} day{est.billedDays === 1 ? "" : "s"}</dt>
                        <dd className="h-display text-4xl">{formatMoney(est.subtotalCents)}</dd>
                      </div>
                    </dl>
                    <dl className="mt-4 space-y-2 text-xs text-silver">
                      <div className="flex justify-between"><dt>Included mileage</dt><dd>{est.includedMiles.toLocaleString()} miles</dd></div>
                      <div className="flex justify-between"><dt>Additional mileage</dt><dd>{formatMoney(est.extraMileCents)} / mile</dd></div>
                      <div className="flex justify-between"><dt>Security deposit</dt><dd>{formatMoney(est.depositCents)}</dd></div>
                    </dl>
                    {conflict && <p className="mt-4 text-xs text-red-300">Unavailable on {formatDate(conflict)}.</p>}
                  </>
                )}
                <p className="mt-6 text-[11px] leading-relaxed text-mist">
                  Estimate only. Each started 24-hour period counts as a rental day. Excludes any applicable taxes and fees. Final pricing is confirmed by VENO upon approval.
                </p>
                {est?.promoTitle && disclaimer && <p className="mt-3 text-[11px] leading-relaxed text-mist">{disclaimer}</p>}
              </>
            )}
          </div>
        </aside>
      </div>
    </form>
  );
}
