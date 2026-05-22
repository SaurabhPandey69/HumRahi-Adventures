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

    // 🔍 vendor fetch once (reuse everywhere)
    const vendor = await prisma.vendor.findUnique({
      where: { id: booking.vendorId },
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
    
      // ✅ EMAIL (CANCEL APPROVED)
      if (vendor?.contactEmail) {
        await sendEmail(
          vendor.contactEmail,
          "Cancellation Approved ✅",
          `
          <h2>Cancellation Approved</h2>
          <p>Your booking has been successfully cancelled.</p>
          <p><b>Date:</b> ${booking.date.toDateString()}</p>
          `
        );
      }
    }
    
    // ============================
    // 🟡 REJECT CASE
    // ============================
    if (body.rejectReason) {
      if (vendor?.contactEmail) {
        await sendEmail(
          vendor.contactEmail,
          "Cancellation Request Rejected ❌",
         `<h2>Cancellation Rejected</h2>
          <p>Your cancellation request was rejected.</p>
          <p><b>Reason:</b> ${body.rejectReason}</p>
          <p><b>Date:</b> ${booking.date.toDateString()}</p>
          `
        );
      }
    }

    // ============================
    // 🔵 BOOKING APPROVED (NEW)
    // ============================
    if (body.status === "CONFIRMED") {
      if (vendor?.contactEmail) {
        await sendEmail(
          vendor.contactEmail,
          "Booking Confirmed 🎉",
          `
          <h2>Booking Confirmed</h2>
          <p>You have a new confirmed booking.</p>
          <p><b>Customer:</b> ${booking.userName}</p>
          <p><b>Date:</b> ${booking.date.toDateString()}</p>
          `
        );
      }
    }

    return NextResponse.json(booking);

  } catch (error) {
    console.error("❌ Update Error:", error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}