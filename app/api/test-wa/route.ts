import { sendWhatsApp } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

export async function GET() {
  await sendWhatsApp(
    "917906569661",
    "🔥 CRM WhatsApp automation working!"
  );

  return NextResponse.json({ success: true });
}


