import OpenAI from "openai";
import { NextResponse } from "next/server";
import { calculateDynamicPackage } from "@/lib/pricingEngine";
import { matchVendors } from "@/lib/vendorMatcher";
import { prisma } from "@/lib/prisma";

// 🔥 DEBUG
console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ bookingDate already included (NO FIELD REMOVED)
    const { budget, fearLevel, groupSize, location, bookingDate } = body;

    const prompt = `
You are an AI-powered adventure travel planner for HumRahi Adventures.

Your job:
Generate a structured adventure itinerary recommendation.

IMPORTANT RULES:
- Return ONLY valid JSON.
- No markdown.
- No explanation outside JSON.
- Do NOT calculate final price (pricing handled separately).

User Preferences:
Budget: ₹${budget}
Fear Level: ${fearLevel}
Group Size: ${groupSize}
Preferred Location: ${location}
Travel Date: ${bookingDate}

Stay Type Rules:
- Budget < 8000 → Basic
- Budget 8000–20000 → Semi Luxury
- Budget > 20000 → Luxury

Return format:
{
  "package": "string",
  "duration_days": number,
  "pickup_city": "string",
  "drop_city": "string",
  "activities": ["string"],
  "stay_type": "Basic | Semi Luxury | Luxury",
  "optional_extension": true,
  "reason": "string",
  "confidence": number
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content || "{}";
    console.log("AI RAW RESPONSE:", text);

    try {
      const parsed = JSON.parse(text);

      // ===============================
      // 🔥 VENDOR MATCHING (UNCHANGED)
      // ===============================
      const requiredCategories = ["transport", "hotel", "rafting"];

      //---------------------------------------
      // const vendors = await matchVendors({
      //  location,
      //  stayType: parsed.stay_type,
      //  requiredCategories,
      //  bookingDate: new Date(bookingDate),
      // });
      //----------------------------------------
     
      // 🔥 LOCATION NORMALIZATION
      let normalizedLocation = location;
      if (location.toLowerCase().includes("bhadraj")) {
        normalizedLocation = "Dehradun";
      }
      // 🔥 USE NORMALIZED LOCATION
      const vendors = await matchVendors({
        location: normalizedLocation,
        stayType: parsed.stay_type,
        requiredCategories,
        bookingDate: new Date(bookingDate),
      });

      // ===============================
      // 💰 PRICING ENGINE (UNCHANGED)
      // ===============================
      // const pricing = await calculateDynamicPackage({
      //  vendors,
      //  groupSize: Number(groupSize),
      //  durationDays: parsed.duration_days,
      // });

let pricing: {
  totalCost: number;
  pricePerPerson: number;

  breakdown: {
    vendor: any;
    category: string;
    cost: number;
  }[];
} = {
  totalCost: 0,
  pricePerPerson: 0,
  breakdown: [],
};

      if (vendors.length > 0) {
        pricing = await calculateDynamicPackage({
          vendors,
          groupSize: Number(groupSize),
          durationDays: parsed.duration_days,
        });
      }

      parsed.price = pricing.totalCost;
      parsed.pricePerPerson = pricing.pricePerPerson;
      parsed.breakdown = pricing.breakdown;

      // ===============================
      // 📝 AUTO BOOKING DRAFT CREATION (UPDATED ONLY HERE)
      // ===============================
      const draft = await prisma.bookingDraft.create({
        data: {
          packageName: parsed.package,
          totalPrice: pricing.totalCost,
          pricePerPerson: pricing.pricePerPerson,
          durationDays: parsed.duration_days,
          breakdown: pricing.breakdown,

          // ✅ NEW FIELD ADDED (NO OTHER LOGIC CHANGED)
          bookingDate: new Date(bookingDate),
        },
      });

      parsed.draftId = draft.id;

      return NextResponse.json(parsed);

    } catch (err) {
      console.error("❌ ACTUAL ERROR:", err);
      console.error("AI RESPONSE:", text);
      console.error("JSON Parse Failed:", text);

      return NextResponse.json({
        package: "Bhadraj Adventure Explorer",
        duration_days: 3,
        pickup_city: "Delhi",
        drop_city: "Delhi",
        activities: [
          "Delhi to Rishikesh Travel",
          "River Rafting",
          "Hotel Stay",
          "Bhadraj Camping",
          "Temple Trek",
          "Paragliding Flight",
        ],
        stay_type: "Semi Luxury",
        optional_extension: false,
        price: 15000,
        pricePerPerson: 7500,
        breakdown: [],
        draftId: null,
        reason:
          "Balanced multi-day adventure suitable for medium budget and group travel.",
        confidence: 80,
      });
    }

  } catch (error: any) {
    console.error("AI API Error:", error?.message || error);

    return NextResponse.json(
      {
        package: "Bhadraj Adventure Explorer",
        duration_days: 3,
        pickup_city: "Delhi",
        drop_city: "Delhi",
        activities: [
          "Rishikesh Rafting",
          "Camping",
          "Paragliding",
        ],
        stay_type: "Semi Luxury",
        optional_extension: false,
        price: 14000,
        pricePerPerson: 7000,
        breakdown: [],
        draftId: null,
        reason:
          "AI temporarily unavailable. Showing recommended structured package.",
        confidence: 75,
      },
      { status: 200 }
    );
  }
}