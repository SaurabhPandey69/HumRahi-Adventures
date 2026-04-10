import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vendors);
}
