import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const vendor = await prisma.vendor.upsert({
      where: {
        authUserId: body.authUserId,
      },

      update: {
        // 🏢 Business Info
        name: body.name,
        category: body.category,
        city: body.city,

        // 💰 Pricing
        basePrice: Number(body.basePrice),
        luxuryLevel: body.luxuryLevel,

        // 🏗 Capacity
        capacity: body.capacity
          ? Number(body.capacity)
          : null,

        // 📞 Contact Info
        contactName: body.contactName || null,
        contactPhone: body.contactPhone || null,
        contactEmail: body.contactEmail,

        // 📝 Notes
        notes: body.notes || null,

        // 🧾 Documents
        gstNumber: body.gstNumber || null,
        licenseUrl: body.licenseUrl || null,

        // ✅ Flags
        phoneVerified: true,
        profileCompleted: true,
      },

      create: {
        // 🔐 Auth
        authUserId: body.authUserId,

        // 🏢 Business Info
        name: body.name,
        category: body.category,
        city: body.city,

        // 💰 Pricing
        basePrice: Number(body.basePrice),
        luxuryLevel: body.luxuryLevel,

        // 🏗 Capacity
        capacity: body.capacity
          ? Number(body.capacity)
          : null,

        // 📞 Contact Info
        contactName: body.contactName || null,
        contactPhone: body.contactPhone || null,
        contactEmail: body.contactEmail,

        // 📝 Notes
        notes: body.notes || null,

        // 🧾 Documents
        gstNumber: body.gstNumber || null,
        licenseUrl: body.licenseUrl || null,

        // ✅ Flags
        phoneVerified: true,
        profileCompleted: true,

        // 🔒 Admin Control
        isApproved: false,
        isActive: true,
      },
    });

    console.log("✅ Vendor Saved:", vendor.id);

    return NextResponse.json(vendor);

  } catch (error) {
    console.error("Vendor Registration Error:", error);

    return NextResponse.json(
      { error: "Vendor registration failed" },
      { status: 500 }
    );
  }
}
