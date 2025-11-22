
import { db } from "@/lib/db/drizzle";
import { bookings, users, doctors, services, encounters } from "@/lib/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { alias } from "drizzle-orm/pg-core";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const patientUsers = alias(users, "patientUsers");

    const todaysAppointments = await db
      .select({
        booking: bookings,
        service: services,
        doctor: doctors,
        doctorUser: users,
        patientUser: patientUsers,
      })
      .from(bookings)
      .where(and(
        gte(bookings.startDateUTC, today),
        lt(bookings.startDateUTC, tomorrow)
      ))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(doctors, eq(services.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .innerJoin(encounters, eq(bookings.encounterId, encounters.id))
      .innerJoin(patientUsers, eq(encounters.patientId, patientUsers.id));

    return NextResponse.json(todaysAppointments);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}