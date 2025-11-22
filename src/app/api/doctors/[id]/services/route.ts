
import { db } from "@/lib/db/drizzle";
import { services } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get all services for a doctor
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = await context;
    const { id } = await params;
    const doctorServices = await db
      .select()
      .from(services)
      .where(eq(services.doctorId, Number(id)));

    return NextResponse.json(doctorServices);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new service for a doctor
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = await context;
    const { id } = await params;
    const body = await req.json();
    const { name, duration, consultationFee, currency } = body;

    const [newService] = await db
      .insert(services)
      .values({ name, duration, consultationFee, currency, doctorId: Number(id) })
      .returning();

    return NextResponse.json(newService);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
