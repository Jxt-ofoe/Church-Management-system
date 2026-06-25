import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, attendance, offerings } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allServices = await db
      .select()
      .from(services)
      .orderBy(desc(services.date));
    return NextResponse.json(allServices);
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}


interface PartnershipEntry {
  amount: number;
  toward: string;
}

interface ServicePayload {
  date: string;
  label: string;
  headcount: number;
  absentMemberIds: number[];
  offerings: {
    general: number;
    seed: number;
    partnerships: PartnershipEntry[];
  };
}

export async function POST(request: Request) {
  try {
    const body: ServicePayload = await request.json();
    const { date, label, headcount, absentMemberIds, offerings: offeringData } = body;

    if (!date || headcount === undefined) {
      return NextResponse.json(
        { error: "Date and headcount are required" },
        { status: 400 }
      );
    }

    // Use a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // 1. Create the service
      const [newService] = await tx
        .insert(services)
        .values({
          date,
          label: label || "Sunday Service",
          headcount,
        })
        .returning();

      // 2. Create attendance records for absent members
      if (absentMemberIds && absentMemberIds.length > 0) {
        await tx.insert(attendance).values(
          absentMemberIds.map((memberId) => ({
            serviceId: newService.id,
            memberId,
            status: "absent",
          }))
        );
      }

      // 3. Create offering records
      const offeringRows: {
        serviceId: number;
        type: string;
        amount: number;
        toward?: string;
      }[] = [];

      if (offeringData.general && offeringData.general > 0) {
        offeringRows.push({
          serviceId: newService.id,
          type: "general",
          amount: offeringData.general,
        });
      }

      if (offeringData.seed && offeringData.seed > 0) {
        offeringRows.push({
          serviceId: newService.id,
          type: "seed",
          amount: offeringData.seed,
        });
      }

      if (offeringData.partnerships && offeringData.partnerships.length > 0) {
        for (const p of offeringData.partnerships) {
          if (p.amount > 0) {
            offeringRows.push({
              serviceId: newService.id,
              type: "partnership",
              amount: p.amount,
              toward: p.toward || undefined,
            });
          }
        }
      }

      if (offeringRows.length > 0) {
        await tx.insert(offerings).values(offeringRows);
      }

      return newService;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
