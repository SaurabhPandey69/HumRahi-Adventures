import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const vendor = await prisma.vendor.create({
      data: {
        authUserId:
          body.authUserId ||
          crypto.randomUUID(),

        name: body.name,

        category: body.category,

        city: body.city,

        basePrice: Number(body.basePrice || 0),

        luxuryLevel: body.luxuryLevel,

        contactPhone: body.contactPhone,

        contactEmail: body.contactEmail,

        isApproved: false,

        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      vendor,
    });

  } catch (error) {
    console.error("Vendor register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Vendor registration failed",
      },
      { status: 500 }
    );
  }
}