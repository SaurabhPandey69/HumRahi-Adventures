import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================
// POST /api/otp/email/verify
// =====================
export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP required" }, { status: 400 });
    }

    // Get latest OTP for this email
    const record = await prisma.emailOtp.findFirst({
      where: { email, verified: false },
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
      await prisma.emailOtp.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    // Mark verified
    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Email OTP verify error:", error);
    return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 });
  }
}
