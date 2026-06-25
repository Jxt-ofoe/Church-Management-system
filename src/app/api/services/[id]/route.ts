import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, attendance, offerings, members } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
    }

    // Get the service
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Get attendance with member names
    const absentRecords = await db
      .select({
        memberId: attendance.memberId,
        memberName: members.name,
      })
      .from(attendance)
      .innerJoin(members, eq(attendance.memberId, members.id))
      .where(eq(attendance.serviceId, id));

    // Get offerings
    const serviceOfferings = await db
      .select()
      .from(offerings)
      .where(eq(offerings.serviceId, id));

    return NextResponse.json({
      ...service,
      absentMembers: absentRecords,
      offerings: serviceOfferings,
    });
  } catch (error) {
    console.error(`GET /api/services/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

