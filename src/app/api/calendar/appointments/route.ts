import { db } from "@/lib/db/drizzle";
import {
  bookings,
  users,
  doctors,
  services,
  encounters,
  memberships,
} from "@/lib/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { alias } from "drizzle-orm/pg-core";
import { auth } from "@/lib/auth/auth";

function safeDate(input: string) {
  const normalized = input.replace(" ", "+"); // fix malformed timezone
  const d = new Date(normalized);
  if (isNaN(d.getTime())) {
    throw new Error("Invalid date: " + input);
  }
  return d;
}

export async function GET(request: Request) {
  // ---- AUTH ----
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const adminMembership = await db.query.memberships.findFirst({
    where: and(eq(memberships.userId, userId), eq(memberships.role, "admin")),
  });

  if (!adminMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hospitalId = adminMembership.hospitalId;

  // ---- DATE FILTERS ----
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing start or end date" },
      { status: 400 }
    );
  }

  const startDate = safeDate(start);
  const endDate = safeDate(end);

  try {
    const doctorUsers = alias(users, "doctorUsers");
    const patientUsers = alias(users, "patientUsers");

    const appointments = await db
      .select({
        booking: {
          id: bookings.id,
          startDateUTC: bookings.startDateUTC,
          endDateUTC: bookings.endDateUTC,
          status: bookings.status,
          encounterId: bookings.encounterId,
        },
        service: {
          id: services.id,
          name: services.name,
          duration: services.duration,
          consultationFee: services.consultationFee,
          currency: services.currency,
          doctorId: services.doctorId,
        },
        doctor: {
          id: doctors.id,
          speciality: doctors.speciality,
          user: {
            name: doctorUsers.name,
            email: doctorUsers.email,
          },
        },
        patient: {
          name: patientUsers.name,
          email: patientUsers.email,
        },
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(
        doctors,
        and(
          eq(services.doctorId, doctors.id),
          eq(doctors.hospitalId, hospitalId) // ← THE REAL HOSPITAL FILTER
        )
      )
      .innerJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .innerJoin(encounters, eq(bookings.encounterId, encounters.id))
      .innerJoin(patientUsers, eq(encounters.patientId, patientUsers.id))
      .where(
        and(
          gte(bookings.startDateUTC, startDate),
          lte(bookings.endDateUTC, endDate)
        )
      );
    console.log(appointments);

    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
