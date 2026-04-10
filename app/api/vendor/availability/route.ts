import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =========================================================
// 🟢 POST — CREATE / UPDATE AVAILABILITY
// =========================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { vendorId, date, startDate, endDate, available } = body;

    // =========================================================
    // 🟢 CASE 1 — SINGLE DATE (STRING BASED ✅)
    // =========================================================
    if (date && !startDate && !endDate) {
      const availability = await prisma.vendorAvailability.upsert({
        where: {
          vendorId_date: {
            vendorId,
            date, // ✅ STRING
          },
        },
        update: {
          available: available ?? true,
        },
        create: {
          vendorId,
          date, // ✅ STRING
          available: available ?? true,
        },
      });

      return NextResponse.json({
        success: true,
        type: "single",
        data: availability,
      });
    }

    // =========================================================
    // 🟡 CASE 2 — BULK RANGE (FIXED — NO toISOString ❌)
    // =========================================================
    if (startDate && endDate) {
      const dates: string[] = [];

      let current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        // ✅ FINAL FIX (NO TIMEZONE ISSUE)
        const formatted =
          current.getFullYear() +
          "-" +
          String(current.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(current.getDate()).padStart(2, "0");

        dates.push(formatted);

        current.setDate(current.getDate() + 1);
      }

      const results = [];

      for (const d of dates) {
        const res = await prisma.vendorAvailability.upsert({
          where: {
            vendorId_date: {
              vendorId,
              date: d, // ✅ STRING
            },
          },
          update: {
            available: available ?? true,
          },
          create: {
            vendorId,
            date: d, // ✅ STRING
            available: available ?? true,
          },
        });

        results.push(res);
      }

      return NextResponse.json({
        success: true,
        type: "bulk",
        count: results.length,
        data: results,
      });
    }

    // =========================================================
    // 🔴 INVALID REQUEST
    // =========================================================
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Availability Error:", error);

    return NextResponse.json(
      { error: "Availability save failed" },
      { status: 500 }
    );
  }
}

// =========================================================
// 🔵 GET — FETCH AVAILABILITY
// =========================================================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "vendorId is required" },
        { status: 400 }
      );
    }

    const data = await prisma.vendorAvailability.findMany({
      where: { vendorId },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error("Availability Fetch Error:", error);

    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}
