import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { consultations, doctors, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

    const doctordetails = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, params.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .innerJoin(, eq(doctore));
  // Get all the information about the doctor and his cosultations
}
