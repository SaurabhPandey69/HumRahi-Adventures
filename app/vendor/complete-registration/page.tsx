"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function CompleteRegistration() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // OTP STATES
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    city: "",
    basePrice: "",
    luxuryLevel: "",
    capacity: "",
    contactName: "",
    contactPhone: "",
    notes: "",
    gstNumber: "",
    licenseFile: null as File | null,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/vendor/login");
      } else {
        setUser(data.user);
      }
    });
  }, [router]);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const uploadFile = async () => {
    if (!form.licenseFile || !user) return null;

    const filePath = `licenses/${user.id}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("vendor-documents")
      .upload(filePath, form.licenseFile);

    if (error) {
      alert("File upload failed");
      return null;
    }

    const { data } = supabase.storage
      .from("vendor-documents")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // ✅ FIXED SEND OTP
  const sendOtp = async () => {
    if (!form.contactPhone) {
      alert("Enter phone number first");
      return;
    }

    // remove +91 for Fast2SMS
    const phone = form.contactPhone.replace("+91", "");

    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
      }),
    });

    if (res.ok) {
      setOtpSent(true);
      alert("OTP Sent");
    } else {
      alert("Failed to send OTP");
    }
  };

  // ✅ FIXED VERIFY OTP
  const verifyOtp = async () => {
    const phone = form.contactPhone.replace("+91", "");

    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        otp,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setPhoneVerified(true);
      alert("Phone Verified");
    } else {
      alert(data.error);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.category ||
      !form.city ||
      !form.basePrice ||
      !form.luxuryLevel ||
      !form.contactName ||
      !form.contactPhone
    ) {
      alert("Please fill all required fields marked with *");
      return;
    }

    if (!phoneVerified) {
      alert("Please verify your phone first");
      return;
    }

    try {
      setLoading(true);

      const licenseUrl = await uploadFile();

      await fetch("/api/vendor/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          licenseUrl,
          authUserId: user.id,
          contactEmail: user.email,
        }),
      });

      router.push("/vendor/dashboard");

    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">
          🚀 Complete Your Business Profile
        </h1>
        <p className="text-gray-600">
          Join <strong>HumRahi Adventures</strong> and boost your adventure
          business with AI-powered bookings & secure payments.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-6">
        <div className="h-2 bg-gray-300 rounded">
          <div
            className="h-2 bg-black rounded transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <p className="text-sm mt-2 text-center">
          Step {step} of 3
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">

            <input
              name="name"
              placeholder="Business Name *"
              onChange={handleChange}
              className="border p-3 rounded col-span-2"
            />

            <select
              name="category"
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="">Select Category *</option>
              <option value="rafting">Rafting</option>
              <option value="hotel">Hotel</option>
              <option value="transport">Transport</option>
              <option value="trekking">Trekking</option>
              <option value="paragliding">Paragliding</option>
              <option value="camping">Camping</option>
              <option value="guide">Tour Guide</option>
            </select>

            <input
              name="city"
              placeholder="City *"
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <input
              name="basePrice"
              placeholder="Base Price *"
              type="number"
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <select
              name="luxuryLevel"
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="">Luxury Level *</option>
              <option value="Basic">Basic</option>
              <option value="Semi">Semi</option>
              <option value="Luxury">Luxury</option>
            </select>

            <input
              name="capacity"
              placeholder="Capacity"
              type="number"
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-black text-white px-6 py-2 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">

            <input
              name="gstNumber"
              placeholder="GST Number"
              onChange={handleChange}
              className="border p-3 rounded w-full"
            />

            <input
              type="file"
              name="licenseFile"
              onChange={handleChange}
              className="border p-3 rounded w-full"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="border px-6 py-2 rounded"
              >
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="bg-black text-white px-6 py-2 rounded"
              >
                Next
              </button>
            </div>

          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">

            <input
              name="contactName"
              placeholder="Contact Person Name *"
              onChange={handleChange}
              className="border p-3 rounded w-full"
            />

            <PhoneInput
              country={"in"}
              value={form.contactPhone}
              onChange={(phone) =>
                setForm({ ...form, contactPhone: phone })
              }
              inputClass="!w-full !py-3"
              containerClass="w-full"
            />

            {!phoneVerified && (
              <>
                {!otpSent ? (
                  <button
                    onClick={sendOtp}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Send OTP
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="border p-3 rounded w-full"
                    />

                    <button
                      onClick={verifyOtp}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Verify OTP
                    </button>
                  </>
                )}
              </>
            )}

            {phoneVerified && (
              <p className="text-green-600 font-semibold">
                ✅ Phone Verified
              </p>
            )}

            <textarea
              name="notes"
              placeholder="Additional Notes"
              onChange={handleChange}
              className="border p-3 rounded w-full"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="border px-6 py-2 rounded"
              >
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded"
              >
                {loading ? "Submitting..." : "Complete Registration"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}