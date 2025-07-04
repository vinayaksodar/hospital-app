import { Suspense } from "react";
import Filter from "./filter";
import BookingsTable from "./table";
import { BookingsTableSkeleton } from "@/components/ui/skeletons";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function Page(props: {
  searchParams?: Promise<{
    docterId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}) {
  //TODO: Maybe add it in every page so that nothing gets shown to unauthenticated users not even page structure. See if middleware is answer
  // // Check authentication first
  // const session = await auth();

  // if (!session?.user || session.user.role !== "admin") {
  //   redirect("/login"); // Will redirect immediately without rendering anything
  // }

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
