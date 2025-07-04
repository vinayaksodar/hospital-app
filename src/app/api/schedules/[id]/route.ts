import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { availabilities, consultations, schedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  //   if (!session?.user || session.user.role !== "admin") {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  //   }

  const rows = await db
    .select()
    .from(schedules)
    .where(eq(schedules.id, parseInt(params.id)))
    .innerJoin(availabilities, eq(availabilities.scheduleId, schedules.id))
    .innerJoin(consultations, eq(consultations.scheduleId, schedules.id));

  // Initialize with schedule and nested arrays
  const result = {
    ...(rows[0]?.schedules || {}),
    availabilities: [],
    consultations: [],
  };

  // Get all unique availabilities and consultations
  for (const row of rows) {
    if (
      !result.availabilities.some(
        (availability) => availability.id == row.availabilities.id
      )
    ) {
      result.availabilities.push(row.availabilities);
    }
    if (
      !result.consultations.some(
        (consultation) => consultation.id == row.consultations.id
      )
    ) {
      result.consultations.push(row.consultations);
    }
  }

  return NextResponse.json(result);
}
