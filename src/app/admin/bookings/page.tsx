import { Suspense } from "react";
import Filter from "./filter";
import BookingsTable from "./table";
import { BookingsTableSkeleton } from "@/components/ui/skeletons";

export default async function Page(props: {
  searchParams?: Promise<{
    docterId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const doctorId = searchParams?.docterId || "";
  const startDate = searchParams?.startDate || "";
  const endDate = searchParams?.endDate || "";
  const page = searchParams?.page || "";

  console.log(searchParams);

  return (
    <div>
      {"hello"}
      <div>
        <Filter />
      </div>
      <div>
        <Suspense key={page} fallback={<BookingsTableSkeleton />}>
          <BookingsTable
            doctorId={doctorId}
            startDate={startDate}
            endDate={endDate}
            page={page}
          />
        </Suspense>
      </div>
    </div>
  );
}
