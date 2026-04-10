import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  await prisma.vendor.update({
    where: { id: body.vendorId },
    data: {
      isApproved: true,
    },
  });

  return NextResponse.json({ success: true });
}