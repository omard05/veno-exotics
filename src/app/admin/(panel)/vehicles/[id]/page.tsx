import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicle } from "@/lib/data";
import { Notice, PageTitle, type SP } from "../../ui";
import { VehicleEditor } from "../VehicleEditor";

export default async function EditVehicle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const v = await getVehicle(Number(id));
  if (!v) notFound();
  return (
    <>
      <Link href="/admin/vehicles" className="text-sm text-mist hover:text-white">← Vehicles</Link>
      <div className="mt-4">
        <PageTitle title={`${v.name} ${v.subtitle}`.trim()}>
          <Link href={`/fleet/${v.slug}`} target="_blank" className="text-sm text-silver underline">View on site ↗</Link>
        </PageTitle>
      </div>
      <Notice sp={sp} />
      <VehicleEditor v={v} />
    </>
  );
}
