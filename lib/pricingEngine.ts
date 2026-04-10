interface PricingInput {
  vendors: any[];
  groupSize: number;
  durationDays?: number;
}

export async function calculateDynamicPackage(
  input: PricingInput
) {
  if (!input.vendors || input.vendors.length === 0) {
    throw new Error("No vendors provided for pricing");
  }

  let totalCost = 0;
  let breakdown: any[] = [];

  // ===============================
  // 1️⃣ FULL PACKAGE PROVIDER CHECK
  // ===============================
  const fullPackageVendor = input.vendors.find(
    (vendor) => vendor.isFullPackageProvider
  );

  if (fullPackageVendor) {
    const cost = fullPackageVendor.pricePerPerson
      ? fullPackageVendor.basePrice * input.groupSize
      : fullPackageVendor.basePrice;

    const margin = cost * 0.2;
    const finalPrice = cost + margin;

    return {
      totalCost: finalPrice,
      pricePerPerson: finalPrice / input.groupSize,
      breakdown: [
        {
          vendor: fullPackageVendor.name,
          category: "full_package",
          cost,
        },
      ],
    };
  }

  // ===============================
  // 2️⃣ CATEGORY VALIDATION
  // ===============================
  const hasTransport = input.vendors.some(
    (v) => v.category === "transport"
  );

  const hasStay = input.vendors.some(
    (v) => v.category === "hotel" || v.category === "camping"
  );

  const hasActivity = input.vendors.some(
    (v) =>
      v.category === "rafting" ||
      v.category === "trekking" ||
      v.category === "guide" ||
      v.category === "pilgrimage"
  );

  if (!hasTransport || !hasStay || !hasActivity) {
    throw new Error(
      "Incomplete vendor setup: transport, stay and activity required"
    );
  }

  // ===============================
  // 3️⃣ COST CALCULATION
  // ===============================
  for (const vendor of input.vendors) {
    let cost = vendor.pricePerPerson
      ? vendor.basePrice * input.groupSize
      : vendor.basePrice;

    // 🏨 Multiply stay vendors by duration
    if (
      vendor.category === "hotel" ||
      vendor.category === "camping"
    ) {
      cost = cost * (input.durationDays || 1);
    }

    totalCost += cost;

    breakdown.push({
      vendor: vendor.name,
      category: vendor.category,
      cost,
    });
  }

  // ===============================
  // 4️⃣ PLATFORM MARGIN (20%)
  // ===============================
  const marginPercent = 0.2;
  const platformMargin = totalCost * marginPercent;
  totalCost += platformMargin;

  return {
    totalCost,
    pricePerPerson: totalCost / input.groupSize,
    breakdown,
  };
}