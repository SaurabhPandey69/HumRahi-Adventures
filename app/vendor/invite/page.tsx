"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react"; // 🔥 ADDED

export default function InvitePage() {
  const router = useRouter();
  const params = useSearchParams();
  const invitedEmail = params.get("email");

  // ✅ Google Login (UPDATED redirect)
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href, // 🔥 IMPORTANT FIX
      },
    });
  };

  // 🔥 VERIFY USER FUNCTION (UNCHANGED LOGIC)
  const verifyUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    const loggedInEmail = data.user.email;

    // 🔐 STRICT EMAIL MATCH
    if (loggedInEmail !== invitedEmail) {
      alert(
        `❌ Please login with invited email: ${invitedEmail}`
      );

      await supabase.auth.signOut();
      return;
    }

    // 🔎 Check vendor
    const res = await fetch(
      `/api/vendor/me?authUserId=${data.user.id}`
    );

    const vendorData = await res.json();

    if (vendorData.exists && vendorData.vendor.profileCompleted) {
      router.push("/vendor/dashboard");
    } else {
      router.push("/vendor/complete-registration");
    }
  };

  // 🔥 ✅ ONLY RUN AFTER OAUTH RETURN (CRITICAL FIX)
  useEffect(() => {
    const isOAuthReturn =
      typeof window !== "undefined" &&
      (window.location.hash.includes("access_token") ||
        window.location.search.includes("code"));

    if (!isOAuthReturn) return;

    verifyUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Complete Your Registration
      </h1>

      <p className="mb-6 text-gray-600">
        Use invited email: {invitedEmail}
      </p>

      <button
        onClick={handleGoogleLogin}
        className="bg-black text-white px-6 py-3 rounded"
      >
        Continue with Google
      </button>
    </div>
  );
}
