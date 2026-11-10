"use client";

import { useActionState } from "react";
import { submitBrokerApplication, submitConsignment, submitContact, type FormState } from "@/app/actions";
import { Field, FormMessage, Honeypot, Submit, SuccessPanel } from "./Form";
import { ArrowIcon } from "./Icons";

export function ConsignmentForm() {
  const [state, action] = useActionState<FormState, FormData>(submitConsignment, null);
  if (state?.ok) return <SuccessPanel title="Submission received." message={state.message} />;
  return (
    <form action={action} className="relative space-y-14">
      <Honeypot />
      <fieldset>
        <legend className="eyebrow mb-6 !text-white">Vehicle information</legend>
        <div className="grid gap-8 sm:grid-cols-3">
          <Field label="Year" name="vehicleYear" required state={state} inputMode="numeric" />
          <Field label="Make" name="vehicleMake" required state={state} />
          <Field label="Model" name="vehicleModel" required state={state} />
          <Field label="Trim / package" name="trim" state={state} />
          <Field label="Mileage" name="mileage" state={state} inputMode="numeric" />
          <Field label="Exterior color" name="exteriorColor" state={state} />
          <Field label="VIN (optional)" name="vin" state={state} />
          <Field label="Vehicle location" name="location" state={state} placeholder="City" />
          <Field label="Link to photos (optional)" name="photosLink" type="url" state={state} placeholder="https://" />
        </div>
        <Field className="mt-8" label="Condition, ownership & additional details" name="notes" textarea state={state} />
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-6 !text-white">Owner contact information</legend>
        <div className="grid gap-8 sm:grid-cols-3">
          <Field label="Full name" name="ownerName" required state={state} autoComplete="name" />
          <Field label="Email" name="email" type="email" required state={state} autoComplete="email" />
          <Field label="Phone" name="phone" type="tel" required state={state} autoComplete="tel" />
        </div>
      </fieldset>
      <FormMessage state={state} />
      <Submit>Submit Vehicle <ArrowIcon /></Submit>
    </form>
  );
}

export function BrokerForm() {
  const [state, action] = useActionState<FormState, FormData>(submitBrokerApplication, null);
  if (state?.ok) return <SuccessPanel title="Application received." message={state.message} />;
  return (
    <form action={action} className="relative space-y-8">
      <Honeypot />
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required state={state} autoComplete="name" />
        <Field label="Company (optional)" name="company" state={state} autoComplete="organization" />
        <Field label="Email" name="email" type="email" required state={state} autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" required state={state} autoComplete="tel" />
        <Field label="Instagram / website" name="social" state={state} placeholder="@handle or URL" />
        <Field label="City / region" name="location" state={state} />
      </div>
      <Field label="Tell us about your network and the clients you'd refer" name="network" textarea required state={state} />
      <Field label="Anything else (optional)" name="notes" textarea state={state} />
      <FormMessage state={state} />
      <Submit>Apply to Partner <ArrowIcon /></Submit>
    </form>
  );
}

export function ContactForm() {
  const [state, action] = useActionState<FormState, FormData>(submitContact, null);
  if (state?.ok) return <SuccessPanel title="Message sent." message={state.message} />;
  return (
    <form action={action} className="relative space-y-8">
      <Honeypot />
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required state={state} autoComplete="name" />
        <Field label="Phone (optional)" name="phone" type="tel" state={state} autoComplete="tel" />
      </div>
      <Field label="Email" name="email" type="email" required state={state} autoComplete="email" />
      <Field label="Message" name="message" textarea required state={state} />
      <FormMessage state={state} />
      <Submit>Send Message <ArrowIcon /></Submit>
    </form>
  );
}
