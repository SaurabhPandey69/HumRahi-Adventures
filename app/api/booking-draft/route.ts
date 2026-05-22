import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/booking-draft?draftId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("draftId");

    if (!draftId) {
      return NextResponse.json({ success: false, message: "draftId required" }, { status: 400 });
    }

    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json({ success: false, message: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft });

  } catch (error) {
    console.error("Booking draft fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
