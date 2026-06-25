import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { members, attendance } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    // Delete related attendance records first
    await db.delete(attendance).where(eq(attendance.memberId, id));
    // Then delete the member
    await db.delete(members).where(eq(members.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/members/${params.id} error:`, error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    const { name, phone, email, dob } = await request.json();
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await db
      .update(members)
      .set({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        dob: dob || null,
      })
      .where(eq(members.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(`PUT /api/members/${params.id} error:`, error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}


