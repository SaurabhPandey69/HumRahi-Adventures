import { prisma } from "@/lib/prisma";

interface MatchInput {
  location: string;
  stayType: string;
  requiredCategories: string[];
  bookingDate: Date;
}

export async function matchVendors(input: MatchInput) {

  const bookingDate = new Date(input.bookingDate);

  // 🔥 STEP 1 — LOCATION NORMALIZATION
  let normalizedLocation = input.location;

  if (input.location.toLowerCase().includes("bhadraj")) {
    normalizedLocation = "Dehradun";
  }

  // 🔥 STEP 2 — LUXURY MAPPING (👉 YAHI ADD KARNA HAI)
  const luxuryMap: any = {
    "Basic": ["Basic"],
    "Semi Luxury": ["Semi Luxury", "Basic"],
    "Luxury": ["Luxury", "Semi Luxury", "Basic"],
  };

  const allowedLuxury =
  (luxuryMap[input.stayType] || ["Basic"]).map((l: string) =>
    l.toLowerCase()
  );

  console.log("🎯 Allowed Luxury:", allowedLuxury);

  // 🔥 FIX: Convert to YYYY-MM-DD string (DB format)
  const formattedDate =
    bookingDate.getFullYear() +
    "-" +
    String(bookingDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(bookingDate.getDate()).padStart(2, "0");

    // 🔥 DEBUG 1 (TOP LEVEL)
    console.log("📍 Matching for:", formattedDate, input.location);

  const matchedVendors: any[] = [];

  // 🔥 Loop per category (existing logic SAME)
  for (const category of input.requiredCategories) {
    const vendors = await prisma.vendor.findMany({
      where: {
        city: {
          contains: normalizedLocation,
          mode: "insensitive",
        },
        luxuryLevel: {
          in: allowedLuxury, // 👈 USE HERE
          mode: "insensitive",
        },
        category: {
          contains: category,
          mode: "insensitive",
        },
        isActive: true,
        isApproved: true,
      },
    });

    // 🔥 DEBUG 2 (VENDORS FOUND)
    console.log(`📦 Category: ${category}`);
    console.log("Vendors found:", vendors.length);

    // 🔥 NEW: collect all available vendors (instead of first only)
    const availableVendors: any[] = [];

    for (const v of vendors) {
      const blocked = await prisma.vendorAvailability.findFirst({
        where: {
          vendorId: v.id,
          date: formattedDate, // ✅ STRING MATCH
          available: false,
        },
      });

      if (!blocked) {
        availableVendors.push(v);
      }
    }

    // 🔥 DEBUG 3 (AVAILABLE VENDORS)
    console.log("Available vendors:", availableVendors.length);

    // ❌ No vendor available → skip
    if (availableVendors.length === 0) continue;

    // ============================
    // 🧠 SMART SCORING SYSTEM (UPGRADED)
    // ============================

    const scoredVendors = availableVendors.map((v) => {
      let score = 0;

      // 💰 Cheapest vendor → higher score
      score += 100000 - v.basePrice;

      // ⭐ Rating boost (NEW 🔥)
      score += (v.rating || 0) * 100;

      // 📍 FUTURE READY (distance logic)
      // score += (100 - distance);

      return {
        ...v,
        score,
      };
    });

    // 🔥 Sort by best score (highest first)
    scoredVendors.sort((a, b) => b.score - a.score);

    // ✅ Pick best vendor
    const bestVendor = scoredVendors[0];

    matchedVendors.push(bestVendor);
  }

  return matchedVendors;
}