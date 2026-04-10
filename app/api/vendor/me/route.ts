import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authUserId = searchParams.get("authUserId");

  const vendor = await prisma.vendor.findUnique({
    where: { authUserId: authUserId || "" },
  });

  if (!vendor) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: true, vendor });
}