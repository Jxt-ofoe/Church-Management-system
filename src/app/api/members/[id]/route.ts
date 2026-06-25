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

