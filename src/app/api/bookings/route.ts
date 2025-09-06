
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  const patientUsers = alias(users, "patientUsers");

  const allBookings = await db
    .select({
      ...getTableColumns(bookings),
      service: getTableColumns(services),
      doctor: {
        ...getTableColumns(doctors),
        user: getTableColumns(users),
      },
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
