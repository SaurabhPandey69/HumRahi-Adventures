import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================
// POST /api/otp/phone/verify
// =====================
export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ success: false, message: "Phone and OTP required" }, { status: 400 });
    }

    const normalized = phone.startsWith("+") ? phone : `+91${phone}`;

    const record = await prisma.phoneOtp.findFirst({
      where: { phone: normalized, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ success: false, message: "OTP not found. Please request a new one." }, { status: 404 });
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json({ success: false, message: "OTP expired. Please request a new one." }, { status: 400 });
    }

    if (record.attempts >= 5) {
      return NextResponse.json({ success: false, message: "Too many attempts. Please request a new OTP." }, { status: 429 });
    }

    if (record.otp !== otp) {
      await prisma.phoneOtp.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    await prisma.phoneOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, message: "Phone verified successfully" });

  } catch (error) {
    console.error("Phone OTP verify error:", error);
    return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 });
  }
}
