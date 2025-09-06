import { db } from "@/lib/db/drizzle";
import { schedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleDetails = await db.query.schedules.findFirst({
      where: eq(schedules.id, parseInt(params.id)),
      with: {
        availabilities: true,
      },
    });

    if (!scheduleDetails) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json(scheduleDetails);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}