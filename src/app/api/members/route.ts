import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { members } from "@/lib/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allMembers = await db.select().from(members).orderBy(asc(members.name));
    return NextResponse.json(allMembers);
  } catch (error) {
    console.error("GET /api/members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, email, dob } = await request.json();
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const result = await db
      .insert(members)
      .values({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        dob: dob || null,
      })
      .returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/members error:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}


