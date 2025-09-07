import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  schedules,
  availabilities,
  bookings,
  services,
  encounters,
} from "@/lib/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { addMinutes, parse } from "date-fns";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // -----------------------------
    // 1. Parse query params
    // -----------------------------
    const { params } = await context; // keep async logic
    const { id } = await params;
    const doctorId = parseInt(id);

    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");
    const dateStr = searchParams.get("date"); // yyyy-MM-dd (UTC date)

    if (!serviceId || !dateStr) {
      return NextResponse.json(
        { error: "Missing serviceId or date" },
        { status: 400 }
      );
    }
    if (isNaN(doctorId)) {
      return NextResponse.json({ error: "Invalid doctor ID" }, { status: 400 });
    }

    // Ensure date is treated as UTC midnight
    const selectedDateUTC = new Date(dateStr + "T00:00:00.000Z");

    const startOfDayUTC = new Date(
      Date.UTC(
        selectedDateUTC.getUTCFullYear(),
        selectedDateUTC.getUTCMonth(),
        selectedDateUTC.getUTCDate(),
        0,
        0,
        0
      )
    );
    const endOfDayUTC = new Date(
      Date.UTC(
        selectedDateUTC.getUTCFullYear(),
        selectedDateUTC.getUTCMonth(),
        selectedDateUTC.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    const dayOfWeek = selectedDateUTC.getUTCDay(); // 0 = Sunday

    // -----------------------------
    // 2. Fetch doctor's schedules & availabilities
    // -----------------------------
    const doctorSchedules = await db.query.schedules.findMany({
      where: eq(schedules.doctorId, doctorId),
      with: {
        availabilities: {
          where: (availabilities, { sql }) => sql`${dayOfWeek} = ANY(days)`,
        },
      },
    });

    if (!doctorSchedules.length) return NextResponse.json([]);

    // -----------------------------
    // 3. Fetch service duration
    // -----------------------------
    const service = await db.query.services.findFirst({
      where: eq(services.id, parseInt(serviceId)),
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const duration = service.duration; // minutes
    const step = duration; // can change to 5/10/15 if you want sliding windows

    // -----------------------------
    // 4. Fetch existing bookings for doctor
    // -----------------------------
    const existingBookings = await db
      .select({
        start: bookings.startDateUTC,
        end: bookings.endDateUTC,
      })
      .from(bookings)
      .innerJoin(encounters, eq(bookings.encounterId, encounters.id))
      .where(
        and(
          eq(encounters.doctorId, doctorId),
          gte(bookings.startDateUTC, startOfDayUTC),
          lte(bookings.endDateUTC, endOfDayUTC)
        )
      );

    // -----------------------------
    // 5. Calculate available slots
    // -----------------------------
    const availableSlots: string[] = [];

    const normalizeToMinutes = (date: Date) =>
      new Date(Math.floor(date.getTime() / 60000) * 60000);

    for (const schedule of doctorSchedules) {
      for (const availability of schedule.availabilities) {
        // Parse availability times (in UTC context)
        let currentTime = parse(
          availability.startTime,
          "HH:mm:ss",
          selectedDateUTC
        );
        let endTime = parse(availability.endTime, "HH:mm:ss", selectedDateUTC);
        // normalize both
        currentTime = normalizeToMinutes(currentTime);
        endTime = normalizeToMinutes(endTime);

        while (addMinutes(currentTime, duration) <= endTime) {
          const slotEndTime = addMinutes(currentTime, duration);

          // Check overlap with existing bookings
          const isBooked = existingBookings.some((booking) => {
            const bookingStart = new Date(booking.start); // already UTC
            const bookingEnd = new Date(booking.end);

            return (
              (currentTime >= bookingStart && currentTime < bookingEnd) ||
              (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
              (currentTime <= bookingStart && slotEndTime >= bookingEnd)
            );
          });

          if (!isBooked) {
            availableSlots.push(currentTime.toISOString()); // return UTC ISO strings
          }

          // Move forward by step size
          currentTime = addMinutes(currentTime, step);
        }
      }
    }

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
