
import { db } from "@/lib/db/drizzle";
import { services } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Update a service
export async function PUT(
  req: Request,
  context: { params: Promise<{ id:string; serviceId: string }> }
) {
  try {
    const { params } = await context;
    const { id, serviceId } = await params;
    const body = await req.json();
    const { name, duration, consultationFee, currency } = body;

    const [updatedService] = await db
      .update(services)
      .set({ name, duration, consultationFee, currency })
      .where(and(eq(services.id, Number(serviceId)), eq(services.doctorId, Number(id))))
      .returning();

    return NextResponse.json(updatedService);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a service
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { params } = await context;
    const { id, serviceId } = await params;

    await db.delete(services).where(and(eq(services.id, Number(serviceId)), eq(services.doctorId, Number(id))));

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
