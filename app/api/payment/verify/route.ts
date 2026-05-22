import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyVendors } from "@/lib/vendorNotifier";
import { sendBookingConfirmationEmail } from "@/lib/email";

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
  // 🔥 breakdown may be array (old) or object with leadTraveler/travelers (new)
  const rawBreakdown = draft.breakdown as any;

// ✅ NEW SAFE EXTRACTION
const breakdown =
  rawBreakdown?.breakdown ||
  rawBreakdown?.vendors ||
  rawBreakdown?.itinerary ||
  [];

// 🔥 DEBUG
console.log("🔥 BREAKDOWN:", breakdown);

  // 🔥 Extract traveler info saved by /api/travelers/save
  const leadTraveler = rawBreakdown?.leadTraveler || {};
  const travelers: any[] = rawBreakdown?.travelers || [];

  const vendorNames = [
  ...new Set(
    breakdown
      .filter((item: any) => item?.vendor)
      .map((item: any) => item.vendor)
  ),
] as string[];

console.log("🔥 Vendor Names:", vendorNames);

  const vendors = await prisma.vendor.findMany({
    where: {
      name: { in: vendorNames },
    },
  });

  // 3️⃣ CREATE BOOKINGS (original logic preserved)
  for (const item of breakdown) {
    const vendor = vendors.find((v) => v.name === item.vendor);
    if (!vendor) continue;

    await prisma.booking.create({
      data: {
        vendorId: vendor.id,
        userName: leadTraveler.name || draft.userName || "Guest",
        phone: leadTraveler.phone || draft.phone || "0000000000",
        date: draft.bookingDate,
        status: "CONFIRMED",
      },
    });
  }

  // =========================
  // 🔥 4️⃣ CREATE BOOKING GROUP + TRAVELERS + ACTIVITIES (NEW)
  // =========================

  if (travelers.length > 0) {
    const bookingGroup = await prisma.bookingGroup.create({
      data: {
        packageName: draft.packageName,
        totalAmount: draft.totalPrice,
        bookingDate: draft.bookingDate,
        status: "CONFIRMED",
        leadTravelerName: leadTraveler.name || draft.userName || "Guest",
        leadTravelerPhone: leadTraveler.phone || draft.phone || "0000000000",
        leadTravelerEmail: leadTraveler.email || "",
        draftId: draft.id,
        razorpayPaymentId: razorpay_payment_id,
        itinerary: breakdown,
      },
    });

    // Save each traveler
    for (const t of travelers) {
      await prisma.traveler.create({
        data: {
          bookingId: bookingGroup.id,
          fullName: t.fullName || "Guest",
          email: t.email || "",
          phone: t.phone || "",
          age: t.age || 0,
          gender: t.gender || "",
          aadhaarNumber: t.govIdType === "Aadhaar Card" ? t.govIdNumber : null,
          govIdType: t.govIdType || null,
          govIdNumber: t.govIdNumber || null,
          medicalIssues: t.medicalIssues || null,
          emergencyPhone: t.emergencyPhone || null,
          isPhysicallyFit: t.isPhysicallyFit ?? true,
        },
      });
    }

    // Save each activity
    for (const item of breakdown) {
      const vendor = vendors.find((v) => v.name === item.vendor);
      await prisma.bookingActivity.create({
        data: {
          bookingId: bookingGroup.id,
          activityName: item.category || item.vendor,
          activityDate: item.date ? new Date(item.date) : draft.bookingDate,
          vendorName: item.vendor,
          vendorPhone: vendor?.contactPhone || "",
          vendorEmail: vendor?.contactEmail || "",
          slotTiming: item.slotTiming || "As per schedule",
        },
      });
    }

    // Send confirmation emails to all travelers
    const activities = await prisma.bookingActivity.findMany({
      where: { bookingId: bookingGroup.id },
      orderBy: { activityDate: "asc" },
    });

    const emailTargets = travelers.filter((t: any) => t.email);
    for (const traveler of emailTargets) {
      await sendBookingConfirmationEmail({
        to: traveler.email,
        travelerName: traveler.fullName,
        packageName: draft.packageName,
        bookingDate: draft.bookingDate,
        totalAmount: draft.totalPrice,
        travelers,
        activities,
        leadTraveler,
        bookingGroupId: bookingGroup.id,
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    // Also email lead traveler if not in travelers list
    const leadAlreadySent = emailTargets.some(
      (t: any) => t.email === leadTraveler.email
    );
    if (!leadAlreadySent && leadTraveler.email) {
      await sendBookingConfirmationEmail({
        to: leadTraveler.email,
        travelerName: leadTraveler.name,
        packageName: draft.packageName,
        bookingDate: draft.bookingDate,
        totalAmount: draft.totalPrice,
        travelers,
        activities,
        leadTraveler,
        bookingGroupId: bookingGroup.id,
        razorpayPaymentId: razorpay_payment_id,
      });
    }
  }

    // =========================
    // 🔔 5️⃣ NOTIFY VENDORS
    // =========================

    await notifyVendors(vendors);

    // =========================
    // 🧾 6️⃣ SAVE PAYMENT EVENT (analytics / audit)
    // ========================= 

    await prisma.event.create({
      data: {
        name: "payment_verified",
        data: {
          draftId,
          razorpay_payment_id,
          razorpay_order_id,
          travelers: travelers.length,
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