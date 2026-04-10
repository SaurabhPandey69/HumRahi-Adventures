import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone required" },
        { status: 400 }
      );
    }

    // 🔢 Normalize phone (remove +91 if present)
    const cleanPhone = phone.replace("+91", "");

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ⏳ OTP expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 💾 Save OTP in Prisma
    await prisma.phoneOtp.create({
      data: {
        phone: cleanPhone,
        otp,
        expiresAt,
      },
    });

    // 🔍 Debug API Key (unchanged from your code)
    console.log("FAST2SMS KEY:", process.env.FAST2SMS_API_KEY);

    // 🧪 DEVELOPMENT MODE (SMS disabled)
    console.log("=================================");
    console.log("📱 PHONE:", cleanPhone);
    console.log("🔐 OTP FOR TESTING:", otp);
    console.log("=================================");

    return NextResponse.json({
      success: true,
      message: "OTP generated (check terminal)",
    });

  } catch (error) {
    console.error("OTP SEND ERROR:", error);

    return NextResponse.json(
      { error: "Failed to generate OTP" },
      { status: 500 }
    );
  }
}
