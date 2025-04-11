import { db } from "@/lib/db/drizzle";
import { desc, count, eq, and, gte, lte } from "drizzle-orm";
import { bookings, consultations, doctors, users } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    console.log(session);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Filter parameters
    const doctorIdParam = searchParams.get("doctorId");
    const doctorId = doctorIdParam ? parseInt(doctorIdParam) : null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Base query builder
    let query = db
      .select()
      .from(bookings)
      .innerJoin(consultations, eq(bookings.consultationId, consultations.id))
      .innerJoin(doctors, eq(bookings.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(users.hospitalId, session.user.hospitalId))
      .orderBy(desc(bookings.startDateUTC))
      .$dynamic();

    // Apply filters if they exist
    if (doctorId !== null) {
      query = query.where(eq(bookings.doctorId, doctorId));
    }

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(bookings.startDateUTC, new Date(startDate)),
          lte(bookings.startDateUTC, new Date(endDate))
        )
      );
    } else if (startDate) {
      query = query.where(gte(bookings.startDateUTC, new Date(startDate)));
    } else if (endDate) {
      query = query.where(lte(bookings.startDateUTC, new Date(endDate)));
    }

    // Get paginated data
    const bookingDataRows = await query.limit(limit).offset(offset);
    const bookingData = formatBookingData(bookingDataRows);

    // Get total count (with same filters applied)
    const countQuery = db
      .select({ count: count() })
      .from(bookings)
      .innerJoin(consultations, eq(bookings.consultationId, consultations.id))
      .innerJoin(doctors, eq(bookings.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(users.hospitalId, session.user.hospitalId))
      .$dynamic();

    // Apply same filters to count query
    if (doctorId) {
      countQuery.where(eq(bookings.doctorId, doctorId));
    }

    if (startDate && endDate) {
      countQuery.where(
        and(
          gte(bookings.startDateUTC, new Date(startDate)),
          lte(bookings.startDateUTC, new Date(endDate))
        )
      );
    } else if (startDate) {
      countQuery.where(gte(bookings.startDateUTC, new Date(startDate)));
    } else if (endDate) {
      countQuery.where(lte(bookings.startDateUTC, new Date(endDate)));
    }

    const totalCount = await countQuery.then((res) => res[0]?.count || 0);

    return NextResponse.json({
      bookings: bookingData,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --- Define Your DESIRED OUTPUT Types (Still recommended) ---
// These define the final nested structure you want.
// (Assuming these match your desired output from previous examples)
// interface FormattedUser extends Omit<typeof users.$inferSelect, 'hospitalId' | 'role'> {
//   // Example: Explicitly define if needed, or rely on Omit
//   // Drizzle's $inferSelect gets the base type of a row from the users table
// }
interface FormattedDoctor extends Omit<typeof doctors.$inferSelect, "userId"> {
  // $inferSelect gets the base type for a doctor row
  user: typeof users.$inferSelect; // Use Drizzle's inferred type for user here
}

interface FormattedBooking
  extends Omit<typeof bookings.$inferSelect, "consultationId" | "doctorId"> {
  // $inferSelect gets the base type for a booking row
  consultation: typeof consultations.$inferSelect;
  doctor: FormattedDoctor;
}
// You might need to adjust the Omit<> parts based on exact schema/needs

// --- Updated formatBookingData function ---
// Parameter type uses 'typeof' on the variable holding the query result.
// Return type uses the explicitly defined FormattedBooking interface.
function formatBookingData(
  bookingDataRows: Array<{
    bookings: typeof bookings.$inferSelect;
    consultations: typeof consultations.$inferSelect;
    doctors: typeof doctors.$inferSelect;
    users: typeof users.$inferSelect;
  }>
): FormattedBooking[] {
  const result: FormattedBooking[] = [];

  for (const row of bookingDataRows) {
    // 1. Create FormattedDoctor
    // Prefix 'userId' with '_' because we only use doctorRest
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: _unusedUserId, ...doctorRest } = row.doctors;
    const formattedDoctor: FormattedDoctor = {
      ...doctorRest,
      user: row.users,
    };

    // 3. Create FormattedBooking
    // Prefix 'consultationId' and 'doctorId' with '_'
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      consultationId: _unusedConsultationId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      doctorId: _unusedBookingDoctorId,
      ...bookingRest
    } = row.bookings;
    const formattedBooking: FormattedBooking = {
      ...bookingRest,
      consultation: row.consultations,
      doctor: formattedDoctor,
    };

    result.push(formattedBooking);
  }
  return result;
}
