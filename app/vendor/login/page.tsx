"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Google Login (UNCHANGED)
  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/vendor/login",
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ✅ UPDATED EMAIL SIGNUP (NEW LOGIC — SAFE)
  const handleEmailSignup = async () => {
    const email = prompt("Enter your email:");

    if (!email) return;

    try {
      setLoading(true);

      const res = await fetch("/api/vendor/invite-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      // 🔴 CASE 3 — Vendor already exists
      if (!res.ok) {
        alert(data.error);
        return;
      }

      // 🟡 CASE 2 — User exists in Supabase
      if (data.isExistingUser) {
        alert(
          "User already registered. Please login and complete registration."
        );
        return;
      }

      // 🟢 CASE 1 — New user invite sent
      alert("Invite sent! Please check your email.");

    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 POST LOGIN CHECK FUNCTION (UNCHANGED)
  const handlePostLogin = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

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

  // 🔥 ✅ FINAL FIX — ONLY RUN AFTER OAUTH RETURN (UNCHANGED)
  useEffect(() => {
    const isOAuthReturn =
      typeof window !== "undefined" &&
      (window.location.hash.includes("access_token") ||
        window.location.search.includes("code"));

    if (!isOAuthReturn) return;

    handlePostLogin();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">

      {/* 🔥 Branding Section */}
      <div className="text-center max-w-md mb-10">
        <h1 className="text-3xl font-bold mb-4">
          🚀 Register Your Adventure Business
        </h1>

        <p className="text-gray-600">
          Join <strong>HumRahi Adventures</strong> and grow your business.
          We connect you with verified travelers, secure payments,
          smart bookings, and AI-powered trip matching.
        </p>
      </div>

      {/* 🔐 Login Buttons */}
      <div className="w-full max-w-xs space-y-4">

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
        >
          {loading ? "Processing..." : "Register / Login with Google"}
        </button>

        <button
          onClick={handleEmailSignup}
          disabled={loading}
          className="w-full border border-black py-3 rounded hover:bg-gray-100 transition"
        >
          Signup with Email
        </button>

      </div>

    </div>
  );
}
