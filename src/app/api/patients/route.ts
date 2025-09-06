
import { db } from "@/lib/db/drizzle";
import { patients, users } from "@/lib/db/schema";
import { ilike, or, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Search for patients
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const results = await db
      .select()
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.email, `%${query}%`),
          ilike(users.phone, `%${query}%`)
        )
      );

    return NextResponse.json(results);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new patient
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, hospitalId, dateOfBirth } = body;

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({ name, email, phone })
      .returning();

    // Create patient
    const [newPatient] = await db
      .insert(patients)
      .values({ userId: newUser.id, hospitalId, dateOfBirth })
      .returning();

    return NextResponse.json({ ...newUser, ...newPatient });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
