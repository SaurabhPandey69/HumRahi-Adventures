import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const requests = await prisma.booking.findMany({
    where: {
      status: "CANCEL_REQUESTED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(requests);
}