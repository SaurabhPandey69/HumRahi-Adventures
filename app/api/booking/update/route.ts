import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const booking = await prisma.booking.update({
      where: { id: body.id },
      data: {
        status: body.status,
        cancelReason: body.cancelReason,
        cancelRequested: body.cancelRequested,
        rejectReason: body.rejectReason, // ✅ IMPORTANT
        userName: body.userName || undefined,
      },
    });

    // 🔥 ONLY ADMIN APPROVED CANCEL triggers availability free
    if (body.status === "CANCELLED") {
      const formattedDate =
        booking.date.getFullYear() +
        "-" +
        String(booking.date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(booking.date.getDate()).padStart(2, "0");

      await prisma.vendorAvailability.upsert({
        where: {
          vendorId_date: {
            vendorId: booking.vendorId,
            date: formattedDate,
          },
        },
        update: {
          available: true,
        },
        create: {
          vendorId: booking.vendorId,
          date: formattedDate,
          available: true,
        },
      });
    }

    // ============================
    // 🟡 REJECT CASE
    // ============================
    if (body.rejectReason) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: booking.vendorId },
      });

      if (vendor?.contactEmail) {
        await sendEmail(
          vendor.contactEmail,
          "Cancellation Request Rejected ❌",
          `Your cancellation request has been rejected.

Reason: ${body.rejectReason}

Booking Date: ${booking.date.toDateString()}`
        );
      }
    }

    return NextResponse.json(booking);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}