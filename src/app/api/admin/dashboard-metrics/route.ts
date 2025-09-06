import { db } from "@/lib/db/drizzle";
import { bookings, encounters, patients, payments } from "@/lib/db/schema";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalAppointments = await db
      .select({ count: count() })
      .from(bookings)
      .where(gte(bookings.startDateUTC, today));

    const walkInEncounters = await db
      .select({ count: count() })
      .from(encounters)
      .where(
        and(
          eq(encounters.type, "walk_in"),
          gte(encounters.encounterDateUTC, today)
        )
      );

    const totalRevenue = await db
      .select({ sum: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(gte(payments.createdAt, today));

    const newPatients = await db
      .select({ count: count() })
      .from(patients)
      .where(gte(patients.createdAt, today));

    return NextResponse.json({
      totalAppointments: totalAppointments[0].count,
      walkInEncounters: walkInEncounters[0].count,
      totalRevenue: totalRevenue[0].sum || 0,
      newPatients: newPatients[0].count,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
