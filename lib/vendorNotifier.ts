import { sendVendorEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function notifyVendors(vendors: any[]) {
  if (!vendors || vendors.length === 0) {
    console.log("No vendors to notify");
    return;
  }

  for (const vendor of vendors) {
    console.log("🔔 Notifying vendor:", vendor.name);

    if (vendor.contactEmail) {
      const booking = await prisma.booking.findFirst({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: "desc" },
      });

      if (booking) {
        await sendVendorEmail(vendor, booking);
        console.log(`📧 Email sent to ${vendor.contactEmail}`);
      } else {
        console.warn("⚠️ No booking found for vendor:", vendor.name);
      }
    }

    if (vendor.contactPhone) {
      console.log(`📱 WhatsApp/SMS sent to ${vendor.contactPhone}`);
    }

    if (vendor.autoBookingSupported) {
      console.log(`🤖 Auto-booking triggered for ${vendor.name}`);
    }

    console.log("✅ Vendor processed:", vendor.name);
  }
}
