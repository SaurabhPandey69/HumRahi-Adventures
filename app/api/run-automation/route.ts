import { runAutomation } from "@/lib/automation";
import { NextResponse } from "next/server";

export async function GET() {
  await runAutomation();
  return NextResponse.json({ success: true });
}
