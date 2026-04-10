import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 🔴 CASE 3 — Vendor already exists
    const existingVendor = await prisma.vendor.findFirst({
      where: { contactEmail: email },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: "Business already registered with this email ID" },
        { status: 400 }
      );
    }

    // 🟡 + 🟢 — Try invite
    const { error } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `http://localhost:3000/vendor/invite?email=${email}`,
      });

    // 🟡 CASE — Already in Supabase
    if (error && error.code === "email_exists") {
      return NextResponse.json({
        success: true,
        isExistingUser: true,
      });
    }

    // 🟢 CASE — New user
    return NextResponse.json({
      success: true,
      isExistingUser: false,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Invite failed" },
      { status: 500 }
    );
  }
}
