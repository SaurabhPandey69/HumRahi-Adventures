import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================
// POST /api/travelers/save
// Saves traveler details into BookingDraft.breakdown metadata
// so they're available at checkout + post-payment
// =====================
export async function POST(req: Request) {
  try {
    const { draftId, leadTraveler, travelers } = await req.json();

    if (!draftId || !leadTraveler || !travelers?.length) {
      return NextResponse.json(
        { success: false, message: "draftId, leadTraveler, and travelers are required" },
        { status: 400 }
      );
    }

    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json(
        { success: false, message: "Draft not found" },
        { status: 404 }
      );
    }

    // Merge traveler info into draft
    // ✅ Preserve original AI vendor breakdown
const originalBreakdown = Array.isArray(draft.breakdown)
  ? draft.breakdown
  : (draft.breakdown as any)?.breakdown || [];

await prisma.bookingDraft.update({
  where: { id: draftId },

  data: {
    userName: leadTraveler.name,

    phone: leadTraveler.phone,

    breakdown: {
      breakdown: originalBreakdown, // ✅ vendors preserved

      leadTraveler,

      travelers,
    },
  },
});  

    console.log("✅ Travelers saved for draft:", draftId);

    return NextResponse.json({ success: true, message: "Travelers saved" });

  } catch (error) {
    console.error("Save travelers error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
