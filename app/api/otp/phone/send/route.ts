import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =====================
// POST /api/otp/phone/send
// =====================
export async function POST(req: Request) {
  try {

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone required",
        },
        { status: 400 }
      );
    }

    // Normalize: ensure +91 prefix
    const normalized = phone.startsWith("+")
      ? phone
      : `+91${phone}`;

    const otp = generateOtp();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ✅ SAVE OTP
    await prisma.phoneOtp.create({
      data: {
        phone: normalized,
        otp,
        expiresAt,
      },
    });

    // ============================
    // 🔥 TRY TWILIO FIRST
    // ============================

    try {

      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      );

      await client.messages.create({
        body: `Your HumRahi Adventures OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: normalized,
      });

      console.log("📱 Phone OTP sent to:", normalized);

      return NextResponse.json({
        success: true,
        message: "OTP sent to phone",
      });

    } catch (twilioError) {

      // ============================
      // 🔥 FALLBACK TO CONSOLE
      // ============================

      console.error("❌ Twilio failed:", twilioError);

      console.log("📱 FALLBACK TEST OTP:", otp);

      return NextResponse.json({
        success: true,
        message: "Twilio failed. OTP available in console.",
        otp,
      });
    }

  } catch (error) {

    console.error("Phone OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}