import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  const bookings = await prisma.booking.findMany({
    where: { vendorId },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(bookings);
}