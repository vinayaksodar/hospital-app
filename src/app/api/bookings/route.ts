import { db } from "@/lib/db/drizzle";
import {
  bookings,
  doctors,
  encounters,
  services,
  users,
} from "@/lib/db/schema";
import { desc, eq, getTableColumns, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

const createBookingSchema = z.object({
  patientId: z.string(),
  doctorId: z.number(),
  hospitalId: z.number(),
  serviceId: z.number(),
  startDateUTC: z.string().datetime(),
  endDateUTC: z.string().datetime(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  const patientUsers = alias(users, "patientUsers");

  const allBookings = await db
    .select({
      ...getTableColumns(bookings),
      service: getTableColumns(services),
      doctor: getTableColumns(doctors),
      doctorUser: getTableColumns(users),
      patient: getTableColumns(patientUsers),
    })
    .from(bookings)
    .orderBy(desc(bookings.startDateUTC))
    .limit(limit)
    .offset((page - 1) * limit)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(doctors, eq(services.doctorId, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .innerJoin(encounters, eq(bookings.encounterId, encounters.id))
    .innerJoin(patientUsers, eq(encounters.patientId, patientUsers.id));

  const totalBookings = await db.select({ count: count() }).from(bookings);

  return NextResponse.json({
    bookings: allBookings,
    pagination: {
      total: totalBookings.length,
      page,
      limit,
      totalPages: Math.ceil(totalBookings.length / limit),
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientId,
      doctorId,
      hospitalId,
      serviceId,
      startDateUTC,
      endDateUTC,
    } = createBookingSchema.parse(body);

    // Step 1: Create the encounter
    const [newEncounter] = await db
      .insert(encounters)
      .values({
        patientId,
        doctorId,
        hospitalId,
        encounterDateUTC: new Date(startDateUTC),
        type: "online_booking",
      })
      .returning();

    if (!newEncounter) {
      throw new Error("Failed to create encounter.");
    }

    try {
      // Step 2: Create the booking
      const [newBooking] = await db
        .insert(bookings)
        .values({
          encounterId: newEncounter.id,
          serviceId,
          startDateUTC: new Date(startDateUTC),
          endDateUTC: new Date(endDateUTC),
          status: "confirmed",
        })
        .returning();

      return NextResponse.json(newBooking, { status: 201 });
    } catch (bookingError) {
      // Step 3: If booking fails, delete the encounter
      console.error(
        "Booking creation failed, rolling back encounter...",
        bookingError
      );
      await db.delete(encounters).where(eq(encounters.id, newEncounter.id));
      throw new Error(
        "Failed to create booking. The operation has been rolled back."
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating booking:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
