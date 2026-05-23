"use client";

export const dynamic = "force-dynamic";


import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

import { trackEvent } from "@/lib/trackEvent";

export default function Book() {

  const router = useRouter();

  const recaptchaRef =
    useRef<RecaptchaVerifier | null>(null);

  // =========================
  // 🔥 AI Prefill
  // =========================

  const [selectedPackage, setSelectedPackage] =
    useState<string | null>(null);

  const fromAI =
    selectedPackage ? true : false;

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [pkg, setPkg] = useState("");

  const [otp, setOtp] = useState("");

  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  // =========================
  // 🔥 Read Package from URL
  // =========================

  useEffect(() => {

    if (typeof window === "undefined")
      return;

    const params = new URLSearchParams(
      window.location.search
    );

    const packageFromUrl =
      params.get("package");

    setSelectedPackage(packageFromUrl);

  }, []);

  // =========================
  // ✅ Create Recaptcha ONLY ONCE
  // =========================

  useEffect(() => {

    if (typeof window === "undefined")
      return;

    if (!recaptchaRef.current) {

      recaptchaRef.current =
        new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );

      recaptchaRef.current
        .render()
        .catch(() => {});
    }

  }, []);

  // =========================
  // 🔥 Track AI Booking Entry
  // =========================

  useEffect(() => {

    if (selectedPackage) {

      setPkg(selectedPackage);

      trackEvent(
        "ai_booking_started",
        {
          package: selectedPackage,
          source: "ai_recommendation",
        }
      );
    }

  }, [selectedPackage]);

  // =========================
  // 📩 SEND OTP
  // =========================

  const sendOtp = async () => {

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!phone.startsWith("+")) {
      alert(
        "Use country code (e.g. +91XXXXXXXXXX)"
      );
      return;
    }

    if (!pkg) {
      alert("Please select a package");
      return;
    }

    try {

      setLoading(true);

      if (!recaptchaRef.current) {
        alert(
          "Recaptcha not ready. Refresh page."
        );
        return;
      }

      const result =
        await signInWithPhoneNumber(
          auth,
          phone,
          recaptchaRef.current
        );

      setConfirmation(result);

      // 🔥 Track lead started
      await trackEvent(
        "lead_started",
        {
          name,
          phone,
          package: pkg,
          fromAI,
        }
      );

      alert("OTP sent successfully ✅");

    } catch (error: any) {

      console.error(
        "OTP Error:",
        error
      );

      alert(
        error?.message ||
        "Failed to send OTP ❌"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // 🔐 VERIFY OTP
  // =========================

  const verifyOtp = async () => {

    if (!confirmation) return;

    try {

      setLoading(true);

      await confirmation.confirm(otp);

      // 🔥 Track conversion
      await trackEvent(
        "booking_submitted",
        {
          name,
          phone,
          package: pkg,
          fromAI,
          verified: true,
        }
      );

      alert("Phone verified 🎉");

      // =========================
      // 🔥 CREATE BOOKING DRAFT
      // =========================

      const res = await fetch(
        "/api/ai-recommend",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            phone,
            package: pkg,
          }),
        }
      );

      const data = await res.json();

      console.log(
        "🔥 Draft created:",
        data
      );

      const draftId = data.draftId;

      if (!draftId) {

        alert(
          "Draft creation failed ❌"
        );

        return;
      }

      // =========================
      // ✅ REDIRECT
      // =========================

      router.push(
        `/traveler-details?draftId=${draftId}`
      );

    } catch (error) {

      console.error(
        "Verify OTP Error:",
        error
      );

      alert("Invalid OTP ❌");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="p-10 max-w-md mx-auto space-y-4">

      <h2 className="text-3xl font-bold text-center">
        Book Your Flight 🪂
      </h2>

      {fromAI && (
        <div className="text-green-600 font-semibold text-center">
          🎯 AI Recommended Package Selected
        </div>
      )}

      {/* Name */}

      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        className="w-full border p-3 rounded"
      />

      {/* Phone */}

      <input
        type="tel"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        className="w-full border p-3 rounded"
      />

      {/* Package */}

      <select
        value={pkg}
        onChange={(e) =>
          setPkg(e.target.value)
        }
        className="w-full border p-3 rounded"
      >
        <option value="">
          Select Package
        </option>

        <option value="Sky Starter">
          Sky Starter
        </option>

        <option value="Sky Elite">
          Sky Elite
        </option>

        <option value="Sky Royale">
          Sky Royale
        </option>
      </select>

      {!confirmation ? (

        <button
          onClick={sendOtp}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-3 rounded w-full"
        >
          {loading
            ? "Sending OTP..."
            : "Send OTP"}
        </button>

      ) : (

        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            className="w-full border p-3 rounded"
          />

          <button
            onClick={verifyOtp}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-3 rounded w-full"
          >
            {loading
              ? "Verifying..."
              : "Verify & Continue"}
          </button>
        </>
      )}

      {/* Recaptcha */}

      <div id="recaptcha-container"></div>

    </div>
  );
}