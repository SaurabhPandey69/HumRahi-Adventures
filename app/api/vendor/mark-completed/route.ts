import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID required" },
        { status: 400 }
      );
    }

    // 1️⃣ Mark booking completed
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
      },
    });

    // 2️⃣ Create feedback request
    await prisma.feedbackRequest.create({
      data: {
        bookingId: booking.id,
        status: "PENDING",
      },
    });

    // 🔔 3️⃣ Send feedback link (for now console)
    console.log("Send this to customer 👇");
    console.log(
      `http://localhost:3000/feedback?bookingId=${booking.id}`
    );
    
    return NextResponse.json({
      success: true,
      message: "Marked completed & feedback triggered",
    });

  } catch (error) {
    console.error("MARK COMPLETED ERROR:", error);

    return NextResponse.json(
      { error: "Failed to mark completed" },
      { status: 500 }
    );
  }
}

