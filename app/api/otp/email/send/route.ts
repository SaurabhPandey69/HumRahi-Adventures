import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =====================
// POST /api/otp/email/send
// =====================
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Upsert OTP record
    await prisma.emailOtp.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send email
    await sendEmail(
      email,
      "Your HumRahi Adventures OTP 🔐",
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0a;color:#fff;border-radius:12px;">
          <h2 style="color:#f59e0b;margin-bottom:8px;">HumRahi Adventures</h2>
          <p style="color:#9ca3af;margin-bottom:24px;">Verify your email to continue booking</p>
          <div style="background:#1a1a1a;border:1px solid #f59e0b;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="color:#9ca3af;font-size:14px;margin-bottom:8px;">Your OTP is</p>
            <h1 style="color:#f59e0b;font-size:48px;letter-spacing:12px;margin:0;">${otp}</h1>
            <p style="color:#6b7280;font-size:12px;margin-top:8px;">Valid for 10 minutes</p>
          </div>
          <p style="color:#6b7280;font-size:12px;">If you didn't request this, ignore this email.</p>
        </div>
      `
    );

    console.log("📧 Email OTP sent to:", email);

    return NextResponse.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    console.error("Email OTP error:", error);
    return NextResponse.json({ success: false, message: "Failed to send OTP" }, { status: 500 });
  }
}
