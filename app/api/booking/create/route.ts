import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const booking = await prisma.booking.create({
      data: {
        vendorId: body.vendorId,
        userName: body.userName,
        phone: body.phone,
        date: new Date(body.date),
      },
    });

    // 🔥 AUTO BLOCK DATE
    await prisma.vendorAvailability.create({
      data: {
        vendorId: body.vendorId,
        date: new Date(body.date),
        available: false,
      },
    });

    return NextResponse.json(booking);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Booking failed" },
      { status: 500 }
    );
  }
}
