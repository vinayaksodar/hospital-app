import { db } from "@/lib/db/drizzle";
import {
  doctors,
  users,
  schedules,
  availabilities,
  services,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context;
  const { id } = await params;

  try {
    const doctorDetails = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        doctorProfiles: {
          with: {
            schedules: {
              with: { availabilities: true },
            },
            services: true,
          },
        },
      },
    });

    if (!doctorDetails) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctorDetails);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
