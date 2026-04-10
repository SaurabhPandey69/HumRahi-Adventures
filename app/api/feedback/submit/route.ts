import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bookingId, rating, comment, review } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.review.create({
      data: {
        bookingId,
        vendorId: booking?.vendorId!,
        rating,
        comment,
        review,
        userName: booking?.userName || "Guest",
      },
    });

     // 🔥 2️⃣ Update vendor rating (simple avg)
    const reviews = await prisma.review.findMany({
      where: { vendorId: booking.vendorId },
    });

    const avg =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await prisma.vendor.update({
      where: { id: booking.vendorId },
      data: { rating: avg },
    });

    // 🔥 3️⃣ TRIGGER PAYOUT
    await prisma.event.create({
      data: {
        name: "vendor_payout_initiated",
        data: {
          vendorId: booking.vendorId,
          bookingId,
        },
      },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("FEEDBACK ERROR:", err);

    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
