import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";

import { insertDoctorSchema } from "@/lib/zod/schemas";
import {
  availabilities,
  consultations,
  doctors,
  schedules,
  users,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, sql, and } from "drizzle-orm";
import { scheduler } from "timers/promises";

// ➤ GET all doctors (Admins can only see doctors in their hospital)
export async function GET() {
  console.log("1");
  const session = await auth();
  console.log(session);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const doctorsData = await db.query.users.findMany({
    where: and(
      eq(users.hospitalId, session.user.hospitalId),
      eq(users.role, "doctor") // Add role filter
    ),
    with: {
      doctors: {
        with: {
          schedules: {
            with: {
              availabilities: true,
              consultations: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(doctorsData);
}

// ➤ POST: Add a doctor (Only Admins can add doctors)
export async function POST(req: Request) {
  try {
    const session = await auth();

    // Ensure user is authenticated and has admin privileges
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, speciality, aboutDetails, image } = { ...body };

    // Step 1: Create the User (Doctor)
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        phone,
        role: "doctor", // Assign doctor role
        hospitalId: session.user.hospitalId, // Ensure doctor is in the admin's hospital
      })
      .returning({ id: users.id });

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Step 2: Create the Doctor Profile
    const [newDoctor] = await db
      .insert(doctors)
      .values({
        userId: newUser.id,
        speciality,
        aboutDetails,
        image,
      })
      .returning();

    if (!newDoctor) {
      return NextResponse.json(
        { error: "Failed to create doctor profile" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// function formatDoctorsData(data) {
//   // Reformat the result to nest consultations within availabilities, etc.
// }

// import { auth } from "@/auth";

// export default async function Page() {
//   const session = await auth();

//   if (session?.user?.role === "admin") {
//     return <p>You are an admin, welcome!</p>;
//   }

//   return <p>You are not authorized to view this page!</p>;
// }

// Admins should only see doctors in their hospital
// const doctorsData = await db
//   .select()
//   .from(doctors)
//   .innerJoin(users, eq(doctors.userId, users.id)) // Join users table
//   .where(eq(users.hospitalId, session.user.hospitalId))
//   .leftJoin(schedules, eq(doctors.id, schedules.doctorId))
//   .leftJoin(availabilities, eq(schedules.id, availabilities.scheduleId))
//   .leftJoin(consultations, eq(consultations.scheduleId, schedules.id)); // Filter by hospital

// return NextResponse.json(doctorsData);

// const doctorsData = await db.execute(sql`
//   SELECT
//     jsonb_build_object(
//       'id', users."id",
//       'phone', users."phone",
//       'name', users."name",
//       'email', users."email",
//       'emailVerified', users."emailVerified",
//       'image', users."image",
//       'role', users."role",
//       'hospitalId', users."hospitalId",
//       'doctors', COALESCE(jsonb_agg(
//         DISTINCT jsonb_build_object(
//           'id', doctors."id",
//           'userId', doctors."userId",
//           'speciality', doctors."speciality",
//           'aboutDetails', doctors."aboutDetails",
//           'image', doctors."image",
//           'schedules', (
//             SELECT COALESCE(jsonb_agg(
//               DISTINCT jsonb_build_object(
//                 'id', schedules."id",
//                 'name', schedules."name",
//                 'timezone', schedules."timezone",
//                 'doctorId', schedules."doctorId",
//                 'availabilities', (
//                   SELECT COALESCE(jsonb_agg(
//                     DISTINCT jsonb_build_object(
//                       'id', availabilities."id",
//                       'scheduleId', availabilities."scheduleId",
//                       'days', availabilities."days",
//                       'startTime', availabilities."startTime",
//                       'endTime', availabilities."endTime",
//                       'consultations', (
//                         SELECT COALESCE(jsonb_agg(
//                           DISTINCT jsonb_build_object(
//                             'id', consultations."id",
//                             'scheduleId', consultations."scheduleId",
//                             'duration', consultations."duration",
//                             'consultationFee', consultations."consultationFee",
//                             'currency', consultations."currency"
//                           )
//                         ), '[]'::jsonb)
//                         FROM consultations
//                         WHERE consultations."scheduleId" = schedules."id"
//                       )
//                     )
//                   ), '[]'::jsonb)
//                   FROM availabilities
//                   WHERE availabilities."scheduleId" = schedules."id"
//                 )
//               )
//             ), '[]'::jsonb)
//             FROM schedules
//             WHERE schedules."doctorId" = doctors."id"
//           )
//         )
//       ), '[]'::jsonb)
//     ) AS result
//   FROM users
//   INNER JOIN doctors ON users."id" = doctors."userId"
//   LEFT JOIN schedules ON doctors."id" = schedules."doctorId"
//   LEFT JOIN availabilities ON schedules."id" = availabilities."scheduleId"
//   LEFT JOIN consultations ON schedules."id" = consultations."scheduleId"
//   WHERE users."hospitalId" = ${session.user.hospitalId}
//   GROUP BY users."id"
// `);
// return NextResponse.json(doctorsData.rows.map((row) => row.result));
