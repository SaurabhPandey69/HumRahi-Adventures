import { prisma } from "./prisma";

export async function getAdminStats() {
  const totalVisits = await prisma.event.count({
    where: { name: "click_book_now" },
  });

  const totalLeads = await prisma.event.count({
    where: { name: "lead_created" },
  });

  const totalPayments = await prisma.event.count({
    where: { name: "payment_success" },
  });

  const payments = await prisma.event.findMany({
    where: { name: "payment_success" },
  });

  const revenue = payments.reduce((sum, e) => {
  if (
    typeof e.data === "object" &&
    e.data !== null &&
    "amount" in e.data
  ) {
    const amount = (e.data as any).amount;
    return sum + (Number(amount) || 0);
  }
  return sum;
}, 0);



  const conversion =
    totalLeads > 0 ? ((totalPayments / totalLeads) * 100).toFixed(2) : "0";

  return {
    totalVisits,
    totalLeads,
    totalPayments,
    revenue,
    conversion,
  };
}

