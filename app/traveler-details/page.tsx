"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────
interface Traveler {
  fullName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  govIdType: string;
  govIdNumber: string;
  medicalIssues: string;
  emergencyPhone: string;
}

interface LeadTraveler {
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

const emptyTraveler = (): Traveler => ({
  fullName: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  govIdType: "",
  govIdNumber: "",
  medicalIssues: "",
  emergencyPhone: "",
});

const GOV_ID_TYPES = [
  "Aadhaar Card",
  "Passport",
  "Driving License",
  "Voter ID",
  "PAN Card",
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

// ─── Input Component ──────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-widest uppercase text-amber-400/80">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children || (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all text-sm"
        />
      )}
    </div>
  );
}

// ─── OTP Box ──────────────────────────────────────────────
function OtpVerifier({
  type,
  value,
  verified,
  onVerified,
}: {
  type: "email" | "phone";
  value: string;
  verified: boolean;
  onVerified: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOtp = async () => {
    if (!value) return setError(`Enter ${type} first`);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/otp/${type}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "email" ? { email: value } : { phone: value }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setCountdown(60);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setError("Enter OTP");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/otp/${type}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "email" ? { email: value, otp } : { phone: value, otp }
        ),
      });
      const data = await res.json();
      if (data.success) {
        onVerified();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
        <span className="text-lg">✓</span> {type === "email" ? "Email" : "Phone"} Verified
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-1">
      {!sent ? (
        <button
          onClick={sendOtp}
          disabled={loading || !value}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-lg text-sm transition-all"
        >
          {loading ? "Sending…" : `Send OTP to ${type === "email" ? "Email" : "Phone"}`}
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 outline-none text-sm tracking-widest"
          />
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-lg text-sm transition-all"
          >
            {loading ? "…" : "Verify"}
          </button>
        </div>
      )}
      {sent && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-500">
            OTP sent · {countdown > 0 ? `Resend in ${countdown}s` : ""}
          </span>
          {countdown === 0 && (
            <button onClick={sendOtp} className="text-xs text-amber-400 hover:underline">
              Resend
            </button>
          )}
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function TravelerDetailsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const draftId = params.get("draftId");

  const [step, setStep] = useState<"verify" | "details">("verify");
  const [leadTraveler, setLeadTraveler] = useState<LeadTraveler>({
    name: "",
    email: "",
    phone: "",
    emailVerified: false,
    phoneVerified: false,
  });
  const [numTravelers, setNumTravelers] = useState(1);
  const [travelers, setTravelers] = useState<Traveler[]>([emptyTraveler()]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Sync traveler array length
  useEffect(() => {
    setTravelers((prev) => {
      const next = [...prev];
      while (next.length < numTravelers) next.push(emptyTraveler());
      return next.slice(0, numTravelers);
    });
  }, [numTravelers]);

  const updateTraveler = (i: number, field: keyof Traveler, val: string) => {
    setTravelers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  };

  const canProceedToDetails =
    leadTraveler.name &&
    leadTraveler.email &&
    leadTraveler.phone &&
    leadTraveler.emailVerified &&
    leadTraveler.phoneVerified;

  const validate = () => {
    const errs: string[] = [];
    travelers.forEach((t, i) => {
      if (!t.fullName) errs.push(`Traveler ${i + 1}: Full name required`);
      if (!t.phone) errs.push(`Traveler ${i + 1}: Phone required`);
      if (!t.age) errs.push(`Traveler ${i + 1}: Age required`);
      if (!t.gender) errs.push(`Traveler ${i + 1}: Gender required`);
      if (!t.govIdType) errs.push(`Traveler ${i + 1}: ID type required`);
      if (!t.govIdNumber) errs.push(`Traveler ${i + 1}: ID number required`);
      if (!t.emergencyPhone) errs.push(`Traveler ${i + 1}: Emergency contact required`);
    });
    if (!agreed) errs.push("Please accept the terms & conditions");
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/travelers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          leadTraveler: {
            name: leadTraveler.name,
            email: leadTraveler.email,
            phone: leadTraveler.phone,
          },
          travelers: travelers.map((t) => ({
            ...t,
            age: parseInt(t.age),
            isPhysicallyFit: true,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/review?draftId=${draftId}`);
      } else {
        setErrors([data.message]);
      }
    } catch {
      setErrors(["Something went wrong. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "radial-gradient(ellipse at 20% 0%, #1a0f00 0%, #0a0a0a 60%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');`}</style>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase font-semibold mb-2">
            Step 1 of 3 · Traveler Details
          </p>
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Who's Coming?
          </h1>
          <p className="text-zinc-400 text-sm">
            Fill in traveler details to personalize your adventure booking.
          </p>
        </motion.div>

        {/* Validation Errors */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-950/60 border border-red-700 rounded-xl p-4 mb-6"
            >
              <p className="text-red-400 font-semibold text-sm mb-2">Please fix the following:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((e, i) => (
                  <li key={i} className="text-red-300 text-xs">{e}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── STEP 1: Verify Lead Traveler ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm">1</div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Lead Traveler
            </h2>
            {leadTraveler.emailVerified && leadTraveler.phoneVerified && (
              <span className="ml-auto text-xs bg-emerald-900/60 text-emerald-400 border border-emerald-700 px-3 py-1 rounded-full font-semibold">
                ✓ Verified
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Field
              label="Full Name"
              value={leadTraveler.name}
              onChange={(v) => setLeadTraveler({ ...leadTraveler, name: v })}
              placeholder="As per government ID"
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-widest uppercase text-amber-400/80">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={leadTraveler.email}
                onChange={(e) =>
                  setLeadTraveler({ ...leadTraveler, email: e.target.value, emailVerified: false })
                }
                placeholder="your@email.com"
                className="bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all text-sm"
              />
              <OtpVerifier
                type="email"
                value={leadTraveler.email}
                verified={leadTraveler.emailVerified}
                onVerified={() => setLeadTraveler((prev) => ({ ...prev, emailVerified: true }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-widest uppercase text-amber-400/80">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={leadTraveler.phone}
                onChange={(e) =>
                  setLeadTraveler({ ...leadTraveler, phone: e.target.value, phoneVerified: false })
                }
                placeholder="10-digit mobile number"
                className="bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all text-sm"
              />
              <OtpVerifier
                type="phone"
                value={leadTraveler.phone}
                verified={leadTraveler.phoneVerified}
                onVerified={() => setLeadTraveler((prev) => ({ ...prev, phoneVerified: true }))}
              />
            </div>
          </div>

          {canProceedToDetails && step === "verify" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setStep("details")}
              className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm tracking-wide transition-all"
            >
              Continue → Fill Traveler Details
            </motion.button>
          )}
        </motion.div>

        {/* ─── STEP 2: Traveler Details ─── */}
        <AnimatePresence>
          {step === "details" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Number of travelers */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 mb-6">
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  How many travelers?
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setNumTravelers(Math.max(1, numTravelers - 1))}
                    className="w-10 h-10 rounded-full border border-zinc-700 text-white text-xl hover:border-amber-400 transition-all"
                  >
                    −
                  </button>
                  <span className="text-3xl font-black text-amber-400 w-8 text-center">{numTravelers}</span>
                  <button
                    onClick={() => setNumTravelers(Math.min(20, numTravelers + 1))}
                    className="w-10 h-10 rounded-full border border-zinc-700 text-white text-xl hover:border-amber-400 transition-all"
                  >
                    +
                  </button>
                  <span className="text-zinc-400 text-sm ml-2">person{numTravelers > 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Traveler forms */}
              {travelers.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 mb-5"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-amber-400/40 text-amber-400 flex items-center justify-center font-black text-sm">
                      {i + 1}
                    </div>
                    <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Traveler {i + 1}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    <Field
                      label="Full Name"
                      value={t.fullName}
                      onChange={(v) => updateTraveler(i, "fullName", v)}
                      placeholder="As per government ID"
                      required
                    />

                    <Field
                      label="Email"
                      value={t.email}
                      onChange={(v) => updateTraveler(i, "email", v)}
                      placeholder="email@example.com"
                      type="email"
                    />

                    <Field
                      label="Phone"
                      value={t.phone}
                      onChange={(v) => updateTraveler(i, "phone", v)}
                      placeholder="10-digit number"
                      required
                    />

                    <Field
                      label="Age"
                      value={t.age}
                      onChange={(v) => updateTraveler(i, "age", v)}
                      placeholder="e.g. 25"
                      type="number"
                      required
                    />

                    <Field label="Gender" value={t.gender} onChange={(v) => updateTraveler(i, "gender", v)} required>
                      <select
                        value={t.gender}
                        onChange={(e) => updateTraveler(i, "gender", e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-lg px-4 py-3 text-white outline-none transition-all text-sm appearance-none"
                      >
                        <option value="">Select gender</option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Government ID Type" value={t.govIdType} onChange={(v) => updateTraveler(i, "govIdType", v)} required>
                      <select
                        value={t.govIdType}
                        onChange={(e) => updateTraveler(i, "govIdType", e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-lg px-4 py-3 text-white outline-none transition-all text-sm appearance-none"
                      >
                        <option value="">Select ID type</option>
                        {GOV_ID_TYPES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Government ID Number"
                      value={t.govIdNumber}
                      onChange={(v) => updateTraveler(i, "govIdNumber", v)}
                      placeholder="ID number"
                      required
                    />

                    <Field
                      label="Emergency Contact Number"
                      value={t.emergencyPhone}
                      onChange={(v) => updateTraveler(i, "emergencyPhone", v)}
                      placeholder="Emergency contact"
                      required
                    />

                    <div className="md:col-span-2">
                      <Field
                        label="Medical Issues / Allergies (if any)"
                        value={t.medicalIssues}
                        onChange={(v) => updateTraveler(i, "medicalIssues", v)}
                        placeholder="e.g. Asthma, knee surgery, none"
                      />
                    </div>

                  </div>
                </motion.div>
              ))}

              {/* Consent */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 mb-6"
              >
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Terms & Consent
                </h3>

                <div className="space-y-3 text-sm text-zinc-400 mb-5">
                  <p>By proceeding, all travelers confirm that:</p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-500">
                    <li>They are physically fit to participate in all booked adventure activities.</li>
                    <li>They have disclosed all relevant medical conditions above.</li>
                    <li>They agree to HumRahi Adventures' cancellation and refund policy.</li>
                    <li>They understand that adventure activities carry inherent risks.</li>
                    <li>They will follow all safety instructions provided by vendors.</li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      agreed ? "bg-amber-500 border-amber-500" : "border-zinc-600 group-hover:border-amber-400"
                    }`}
                  >
                    {agreed && <span className="text-black text-xs font-black">✓</span>}
                  </div>
                  <span className="text-zinc-300 text-sm leading-relaxed">
                    I confirm all travelers are physically fit and agree to{" "}
                    <span className="text-amber-400 underline cursor-pointer">
                      HumRahi Adventures Terms & Conditions
                    </span>
                    .
                  </span>
                </label>
              </motion.div>

              {/* Submit */}
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black rounded-2xl text-lg tracking-wide transition-all shadow-lg shadow-amber-900/20"
              >
                {submitting ? "Saving Details…" : "Review My Booking →"}
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
