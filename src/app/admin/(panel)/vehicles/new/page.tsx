import Link from "next/link";
import { Notice, PageTitle, type SP } from "../../ui";
import { VehicleEditor } from "../VehicleEditor";

export default async function NewVehicle({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return (
    <>
      <Link href="/admin/vehicles" className="text-sm text-mist hover:text-white">← Vehicles</Link>
      <div className="mt-4"><PageTitle title="Add vehicle" /></div>
      <Notice sp={sp} />
      <VehicleEditor />
    </>
  );
}
