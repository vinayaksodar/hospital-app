import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { users, doctors, memberships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET all doctors
export async function GET() {
  try {
    const doctorsData = await db.query.memberships.findMany({
      where: eq(memberships.role, "doctor"),
      with: {
        user: {
          with: {
            doctorProfiles: true,
          },
        },
      },
    });

    return NextResponse.json(doctorsData);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Add a doctor
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, speciality, aboutDetails, hospitalId } = {
      ...body,
    };

    // Step 1: Create the User
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        phone,
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
        hospitalId: hospitalId, // Make sure to pass hospitalId in the request body
      })
      .returning();

    if (!newDoctor) {
      return NextResponse.json(
        { error: "Failed to create doctor profile" },
        { status: 500 }
      );
    }

    // Step 3: Create the Membership
    await db.insert(memberships).values({
      userId: newUser.id,
      hospitalId: hospitalId, // Make sure to pass hospitalId in the request body
      role: "doctor",
    });

    return NextResponse.json({ ...newUser, ...newDoctor });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
