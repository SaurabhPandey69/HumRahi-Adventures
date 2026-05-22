import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  const bookings = await prisma.booking.findMany({
    where: { vendorId },
    orderBy: { date: "asc" },
  });

  // 🔥 Enrich each booking with traveler details from BookingGroup
  const enriched = await Promise.all(
    bookings.map(async (booking) => {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId! },
      });

      const activity = vendor
        ? await prisma.bookingActivity.findFirst({
            where: {
              vendorName: vendor.name,
              activityDate: booking.date,
            },
            orderBy: { createdAt: "desc" },
          })
        : null;

      let bookingGroup = null;
      let travelers: any[] = [];

      if (activity) {
        bookingGroup = await prisma.bookingGroup.findUnique({
          where: { id: activity.bookingId },
          include: { travelers: true },
        });
        travelers = bookingGroup?.travelers || [];
      }

      return {
        ...booking,
        bookingGroupId: bookingGroup?.id || null,
        packageName: bookingGroup?.packageName || null,
        totalAmount: bookingGroup?.totalAmount || null,
        leadTravelerName: bookingGroup?.leadTravelerName || booking.userName,
        leadTravelerPhone: bookingGroup?.leadTravelerPhone || booking.phone,
        leadTravelerEmail: bookingGroup?.leadTravelerEmail || null,
        travelerCount: travelers.length || 1,
        travelers: travelers.map((t) => ({
          id: t.id,
          fullName: t.fullName,
          email: t.email,
          phone: t.phone,
          age: t.age,
          gender: t.gender,
          medicalIssues: t.medicalIssues,
          emergencyPhone: t.emergencyPhone,
        })),
        activityName: activity?.activityName || null,
        slotTiming: activity?.slotTiming || null,
      };
    })
  );

  return NextResponse.json(enriched);
}