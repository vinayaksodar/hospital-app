import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { schedules, availabilities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = parseInt(params.id);

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { error: "Invalid doctor ID" },
        { status: 400 }
      );
    }

    const doctorSchedules = await db.query.schedules.findMany({
      where: eq(schedules.doctorId, doctorId),
      with: {
        availabilities: true, // Fetch associated availabilities
      },
    });

    return NextResponse.json(doctorSchedules);
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
