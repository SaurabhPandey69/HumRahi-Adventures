import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const saved = await prisma.event.create({
    data: {
      name: body.event,
      data: body,
    },
  });

  console.log("✅ Event saved:", saved.id);

  return NextResponse.json({ success: true });
}
