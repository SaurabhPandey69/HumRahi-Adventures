import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const isProd = process.env.NODE_ENV === "production";

const razorpay = new Razorpay({
  key_id: isProd
    ? process.env.RAZORPAY_KEY_ID_LIVE!
    : process.env.RAZORPAY_KEY_ID_TEST!,
  key_secret: isProd
    ? process.env.RAZORPAY_KEY_SECRET_LIVE!
    : process.env.RAZORPAY_KEY_SECRET_TEST!,
});

export async function POST(req: Request) {
  const { draftId } = await req.json();

  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    return NextResponse.json(
      { error: "Draft not found" },
      { status: 404 }
    );
  }

  // 🔥 FIX: Ensure minimum amount
  const amount = Math.max(draft.totalPrice * 100, 100); // 🔥 FIX

  // 🔍 DEBUG LOGS
  console.log("💰 Draft Price:", draft.totalPrice);
  console.log("💰 Final Amount (paise):", amount);

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: draft.id,
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
  });
}