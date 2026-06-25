import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, attendance, offerings, members } from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 }
      );
    }

    const monthPadded = month.padStart(2, "0");
    const startDate = `${year}-${monthPadded}-01`;
    const endDate = `${year}-${monthPadded}-31`;

    // Get all services in the month
    const monthServices = await db
      .select()
      .from(services)
      .where(and(gte(services.date, startDate), lte(services.date, endDate)));

    // Build full report for each service
    const report = await Promise.all(
      monthServices.map(async (service) => {
        // Get absent members
        const absentRecords = await db
          .select({
            memberId: attendance.memberId,
            memberName: members.name,
          })
          .from(attendance)
          .innerJoin(members, eq(attendance.memberId, members.id))
          .where(eq(attendance.serviceId, service.id));

        // Get offerings
        const serviceOfferings = await db
          .select()
          .from(offerings)
          .where(eq(offerings.serviceId, service.id));

        return {
          ...service,
          absentMembers: absentRecords,
          offerings: serviceOfferings,
        };
      })
    );

    // Calculate monthly totals
    const allOfferings = report.flatMap((s) => s.offerings);

    const totalGeneral = allOfferings
      .filter((o) => o.type === "general")
      .reduce((sum, o) => sum + o.amount, 0);

    const totalSeed = allOfferings
      .filter((o) => o.type === "seed")
      .reduce((sum, o) => sum + o.amount, 0);

    const partnershipOfferings = allOfferings.filter(
      (o) => o.type === "partnership"
    );

    // Group partnerships by "toward"
    const partnershipByToward: Record<string, number> = {};
    partnershipOfferings.forEach((o) => {
      const key = o.toward || "Unspecified";
      partnershipByToward[key] = (partnershipByToward[key] || 0) + o.amount;
    });

    const totalPartnership = partnershipOfferings.reduce(
      (sum, o) => sum + o.amount,
      0
    );

    const totalAll = totalGeneral + totalSeed + totalPartnership;

    return NextResponse.json({
      month: monthPadded,
      year,
      services: report,
      totals: {
        general: totalGeneral,
        seed: totalSeed,
        partnershipByToward,
        totalPartnership,
        totalAll,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
