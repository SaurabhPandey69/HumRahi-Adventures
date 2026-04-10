import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  const record = await prisma.phoneOtp.findFirst({
    where: {
      phone,
      verified: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return NextResponse.json({ error: "No OTP found" }, { status: 400 });
  }

  if (record.attempts >= 3) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 400 });
  }

  if (new Date() > record.expiresAt) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  if (record.otp !== otp) {
    await prisma.phoneOtp.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });

    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  await prisma.phoneOtp.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return NextResponse.json({ success: true });
}
