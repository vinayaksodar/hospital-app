import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { schedules, availabilities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
// Unused import removed: import { parseAppSegmentConfig } from "next/dist/build/segment-config/app/app-segment-config";

/**
 * Normalizes a time string (e.g., "9:00") into a SQL-compatible format ("09:00:00").
 * @param {string} t - The time string to normalize.
 * @returns {string} The normalized time string.
 */
function normalizeTimeToSql(t: string): string {
  if (!t || typeof t !== "string") throw new Error("Invalid time string");
  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) throw new Error("Time must be H:MM or HH:MM(:SS)");
  const hh = m[1].padStart(2, "0");
  const mm = m[2];
  const ss = m[3] ?? "00";
  return `${hh}:${mm}:${ss}`;
}

/**
 * PUT handler to create or update a doctor's schedule and replace their availabilities.
 * This version is modified to work without database transactions.
 */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // -----------------------------
    // 1. Parse and validate request parameters and body
    // -----------------------------
    const { params } = await context;
    const { id } = await params;
    const doctorId = parseInt(id, 10);

    if (Number.isNaN(doctorId)) {
      return NextResponse.json({ error: "Invalid doctor ID" }, { status: 400 });
    }

    const body = await req.json();
    const rawSchedule =
      body?.schedule ??
      (Array.isArray(body?.schedules) ? body.schedules[0] : body);

    if (!rawSchedule) {
      return NextResponse.json(
        { error: "Missing schedule payload" },
        { status: 400 }
      );
    }

    const name = rawSchedule.name ?? "Default Schedule";
    const timezone = rawSchedule.timezone ?? "UTC";
    const rawAvails = Array.isArray(rawSchedule.availabilities)
      ? rawSchedule.availabilities
      : [];

    // -----------------------------
    // 2. Prepare availabilities for insertion after validation
    // -----------------------------
    const availabilitiesToInsert = rawAvails.map((a: any, idx: number) => {
      if (!Array.isArray(a.days) || a.days.length === 0) {
        throw new Error(
          `availabilities[${idx}].days must be a non-empty array of integers from 0 to 6.`
        );
      }
      const days = a.days.map((d: any) => {
        const n = Number(d);
        if (!Number.isInteger(n) || n < 0 || n > 6) {
          throw new Error(
            `availabilities[${idx}].days contains an invalid day: ${d}`
          );
        }
        return n;
      });

      const startTime = a.startTime ?? a.start ?? a.from;
      const endTime = a.endTime ?? a.end ?? a.to;
      if (!startTime || !endTime) {
        throw new Error(
          `availabilities[${idx}] must include both startTime and endTime.`
        );
      }

      return {
        days,
        startTime: normalizeTimeToSql(startTime),
        endTime: normalizeTimeToSql(endTime),
      };
    });

    // -----------------------------
    // 3. Perform database operations sequentially (NO TRANSACTION)
    // -----------------------------

    // Step 3.1: Find the doctor's existing schedule.
    let schedule = await db.query.schedules.findFirst({
      where: eq(schedules.doctorId, doctorId),
    });

    // Step 3.2: If no schedule exists, create one. If it exists, update its metadata.
    if (!schedule) {
      const [insertedSchedule] = await db
        .insert(schedules)
        .values({ name, timezone, doctorId })
        .returning();
      schedule = insertedSchedule;
    } else {
      await db
        .update(schedules)
        .set({ name, timezone })
        .where(eq(schedules.id, schedule.id));
    }

    // --- NOTE: The following two operations are NOT ATOMIC. ---
    // If the insert operation fails after the delete succeeds,
    // the schedule will be left with no availabilities.
    // Pre-validating the data (as done in step 2) minimizes this risk.

    // Step 3.3: Delete all old availabilities tied to this schedule.
    await db
      .delete(availabilities)
      .where(eq(availabilities.scheduleId, schedule.id));

    // Step 3.4: Insert the new set of availabilities.
    if (availabilitiesToInsert.length > 0) {
      const valuesToInsert = availabilitiesToInsert.map(
        (a: { days: number[]; startTime: string; endTime: string }) => ({
          scheduleId: schedule.id,
          days: a.days,
          startTime: a.startTime,
          endTime: a.endTime,
        })
      );
      await db.insert(availabilities).values(valuesToInsert);
    }

    // Step 3.5: Fetch the final, updated schedule with its new availabilities to return.
    const scheduleWithAvail = await db.query.schedules.findFirst({
      where: eq(schedules.id, schedule.id),
      with: { availabilities: true },
    });

    return NextResponse.json(scheduleWithAvail, { status: 201 });
  } catch (err: any) {
    console.error("Error updating schedule availabilities:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 400 } // Use 400 for client-side errors, could be 500 for true server errors
    );
  }
}

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
    if (Number.isNaN(doctorId)) {
      return NextResponse.json({ error: "Invalid doctor ID" }, { status: 400 });
    }

    // fetch schedules for the doctor along with availabilities
    const doctorSchedules = await db.query.schedules.findMany({
      where: eq(schedules.doctorId, doctorId),
      with: { availabilities: true },
    });

    // return an empty array if none found for easier client handling
    return NextResponse.json(doctorSchedules ?? [], { status: 200 });
  } catch (err: any) {
    console.error("Error fetching doctor schedules:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
