import { prisma } from "./prisma";

export async function getFunnelStats() {
  const visits = await prisma.event.count({
    where: { name: "click_book_now" },
  });

  const leads = await prisma.event.count({
    where: { name: "lead_created" },
  });

  const checkouts = await prisma.event.count({
    where: { name: "checkout_view" }, // ensure you fire this event
  });

  const payments = await prisma.event.count({
    where: { name: "payment_success" },
  });

  const dropVisitToLead = visits - leads;
  const dropLeadToCheckout = leads - checkouts;
  const dropCheckoutToPayment = checkouts - payments;

  const conversion =
    visits > 0 ? ((payments / visits) * 100).toFixed(2) : "0";

  return {
    visits,
    leads,
    checkouts,
    payments,
    dropVisitToLead,
    dropLeadToCheckout,
    dropCheckoutToPayment,
    conversion,
  };
}
