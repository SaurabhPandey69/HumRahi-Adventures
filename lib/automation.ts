import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";

/**
 * 🔥 Get hot leads (30+ min old & no payment)
 */
export async function getHotLeads() {
  const THIRTY_MIN_AGO = new Date(Date.now() - 30 * 60 * 1000);

  return prisma.event.findMany({
    where: {
      name: "lead_created",
      createdAt: { lt: THIRTY_MIN_AGO },
      followUpSent: false,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * 🚀 Main Automation Engine
 */
export async function runAutomation() {
  console.log("⚙️ Running CRM Automation...");

  // ========================================
  // 1️⃣ LEAD REMINDER (Phone Matched Payment Check)
  // ========================================

  const leads = await getHotLeads();
  console.log("Leads found:", leads.length);

  for (const lead of leads) {
    const phone = (lead.data as any)?.phone;
    if (!phone) continue;

    // ✅ Check payment for SAME PHONE
    const payment = await prisma.event.findFirst({
      where: {
        name: "payment_success",
        data: {
          path: ["phone"],
          equals: phone,
        },
      },
    });

    // If no payment → send reminder
    if (!payment) {
      const sent = await sendWhatsApp(
        phone,
        "⚡ Your paragliding slot is waiting! Complete payment to confirm your flight."
      );

      // ✅ Only update if message actually sent
      if (sent) {
        await prisma.event.update({
          where: { id: lead.id },
          data: { followUpSent: true },
        });

        console.log("📩 Reminder sent to:", phone);
      } else {
        console.log("❌ Reminder failed for:", phone);
      }
    }
  }

  // ========================================
  // 2️⃣ HIGH VALUE PAYMENT ALERT (> ₹3000)
  // ========================================

  const highPayments = await prisma.event.findMany({
    where: {
      name: "payment_success",
      followUpSent: false,
    },
  });

  for (const pay of highPayments) {
    const amount = (pay.data as any)?.amount;
    if (!amount) continue;

    if (amount > 3000) {
      const adminPhone = process.env.ADMIN_PHONE;

      if (!adminPhone) {
        console.log("❌ ADMIN_PHONE not configured");
        continue;
      }

      const sent = await sendWhatsApp(
        adminPhone,
        `💰 High Value Payment Received: ₹${amount}`
      );

      // ✅ Only mark as sent if alert actually delivered
      if (sent) {
        await prisma.event.update({
          where: { id: pay.id },
          data: { followUpSent: true },
        });

        console.log("💰 High value alert sent for ₹", amount);
      } else {
        console.log("❌ High value alert failed for ₹", amount);
      }
    }
  }

  console.log("✅ Automation Completed");
}
