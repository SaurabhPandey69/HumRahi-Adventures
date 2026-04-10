import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { prisma } from "@/lib/prisma"; // 🔥 ADDED

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔴 CASE 3 — Vendor already exists (NEW CHECK ADDED)
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        contactEmail: body.contactEmail,
      },
    });

    if (existingVendor) {
      return NextResponse.json(
        {
          error:
            "Business already registered with this email ID",
        },
        { status: 400 }
      );
    }

    // 🔥 STEP 1 — Send Invite Email (EXISTING LOGIC KE SAATH SAFE UPDATE)
    const { data, error } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        body.contactEmail,
        {
          redirectTo:
            "http://localhost:3000/vendor/complete-registration",
        }
      );

    // ❗ UPDATED ERROR HANDLING (email_exists allow kiya)
    if (error && error.code !== "email_exists") {
      console.error("Invite error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // ✅ Success log (UNCHANGED + slight improvement)
    console.log("📧 Invite / Existing user:", body.contactEmail);

    // ✅ Response (UPGRADED)
    return NextResponse.json({
      success: true,
      message:
        error?.code === "email_exists"
          ? "User already registered. Ask vendor to login."
          : "Invite sent successfully",
      isExistingUser: error?.code === "email_exists",
    });

  } catch (error) {
    console.error("Vendor Invite Error:", error);

    return NextResponse.json(
      { error: "Vendor invite failed" },
      { status: 500 }
    );
  }
}
