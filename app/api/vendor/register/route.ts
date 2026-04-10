import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        category: body.category,
        city: body.city,
        basePrice: Number(body.basePrice),
        luxuryLevel: body.luxuryLevel,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,

        // ✅ Admin Approval System
        isApproved: false,   // Vendor must be approved manually
        isActive: true,      // Vendor account exists but not approved yet
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Vendor Registration Error:", error);
    return NextResponse.json(
      { error: "Vendor registration failed" },
      { status: 500 }
    );
  }
}