import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyVendors } from "@/lib/vendorNotifier";

export async function POST(req: Request) {
    try {
    const body = await req.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    draftId,
  } = body;

  // 🔥 ENV SWITCH (test / prod)
    const isProd = process.env.NODE_ENV === "production";

    const secret = isProd
      ? process.env.RAZORPAY_KEY_SECRET_LIVE!
      : process.env.RAZORPAY_KEY_SECRET_TEST!;

  // 🔐 SIGNATURE VERIFY  
  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  // ✅ VERIFY SIGNATURE
  if (generated_signature !== razorpay_signature) {
    return NextResponse.json(
      { success: false, message: "Invalid payment signature" },
      { status: 400 }
    );
  }

  // =========================
    // ✅ PAYMENT VERIFIED
    // =========================

  // ✅ PAYMENT SUCCESS → SAVE BOOKING

  // 1️⃣ Get Draft
  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    return NextResponse.json(
      { success: false, message: "Draft not found" },
      { status: 404 }
    );
  }

  // 2️⃣ Extract Vendors
    const vendorNames = draft.breakdown.map(
      (item: any) => item.vendor
    );

    const vendors = await prisma.vendor.findMany({
      where: {
        name: { in: vendorNames },
      },
    });

    // =========================
    // 🔥 3️⃣ CREATE BOOKINGS (LOOP FIX)
    // =========================

    for (const item of draft.breakdown) {
      const vendor = vendors.find(v => v.name === item.vendor);

      if (!vendor) continue;

      await prisma.booking.create({
        data: {
          vendorId: vendor.id,
          userName: draft.userName || "Guest",
          phone: draft.phone || "0000000000",
          date: draft.bookingDate,
          status: "CONFIRMED",
        },
      });
    }

    // =========================
    // 🔔 4️⃣ NOTIFY VENDORS
    // =========================

    await notifyVendors(vendors);

    // =========================
    // 🧾 5️⃣ SAVE PAYMENT EVENT (analytics / audit)
    // ========================= 

    await prisma.event.create({
      data: {
        name: "payment_verified",
        data: {
          draftId,
          razorpay_payment_id,
          razorpay_order_id,
        },
      },
    });

  return NextResponse.json({
    success: true,
    message: "Payment verified & booking confirmed",
  },
  { status: 200 }
);

} catch (error) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}