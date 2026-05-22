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
const formattedDate =
  new Date(body.date).getFullYear() +
  "-" +
  String(new Date(body.date).getMonth() + 1).padStart(2, "0") +
  "-" +
  String(new Date(body.date).getDate()).padStart(2, "0");

await prisma.vendorAvailability.create({
  data: {
    vendorId: body.vendorId,
    date: formattedDate,
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
