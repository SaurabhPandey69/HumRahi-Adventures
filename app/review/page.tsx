"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface BreakdownItem {
  vendor: string;
  category: string;
  price: number;
  date?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  city?: string;
}

interface Traveler {
  fullName: string;
  email: string;
  phone: string;
  age: number;
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
}

interface Draft {
  id: string;
  packageName: string;
  totalPrice: number;
  pricePerPerson: number;
  durationDays: number;
  bookingDate: string;
  breakdown: {
    leadTraveler: LeadTraveler;
    travelers: Traveler[];
    [key: string]: any;
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-6 mb-5">
      <h2
        className="text-xl font-bold mb-5 text-amber-400"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-zinc-800 last:border-0">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-xs">{value}</span>
    </div>
  );
}

export default function ReviewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const draftId = params.get("draftId");

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!draftId) return;
    fetch(`/api/booking-draft?draftId=${draftId}`)
      .then((r) => r.json())
      .then((d) => {
        setDraft(d.draft);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [draftId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400 text-lg animate-pulse">Loading your booking…</div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Booking not found. Please go back and try again.</div>
      </div>
    );
  }

  const { breakdown } = draft;
  const leadTraveler: LeadTraveler = breakdown.leadTraveler || {};
  const travelers: Traveler[] = breakdown.travelers || [];

  // Extract vendor breakdown items (everything except leadTraveler/travelers keys)
  const vendorItems: BreakdownItem[] = Array.isArray(breakdown)
    ? breakdown
    : Object.entries(breakdown)
        .filter(([k]) => !["leadTraveler", "travelers"].includes(k))
        .flatMap(([, v]) => (Array.isArray(v) ? v : []))
        .filter((v) => v?.vendor);

  // If breakdown was stored as array at root
  const items: BreakdownItem[] = vendorItems.length
    ? vendorItems
    : (breakdown as any)?.filter?.((v: any) => v?.vendor) || [];

  const bookingDate = new Date(draft.bookingDate);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "radial-gradient(ellipse at 80% 0%, #001a0f 0%, #0a0a0a 60%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');`}</style>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase font-semibold mb-2">
            Step 2 of 3 · Review
          </p>
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Review Your Booking
          </h1>
          <p className="text-zinc-400 text-sm">
            Confirm everything looks right before proceeding to payment.
          </p>
        </motion.div>

        {/* Package Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Section title="📦 Package Summary">
            <InfoRow label="Package" value={draft.packageName} />
            <InfoRow label="Duration" value={`${draft.durationDays} Days`} />
            <InfoRow
              label="Travel Date"
              value={bookingDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow label="Travelers" value={`${travelers.length} person${travelers.length > 1 ? "s" : ""}`} />
            <InfoRow label="Price per Person" value={`₹${draft.pricePerPerson.toLocaleString("en-IN")}`} />
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-zinc-700">
              <span className="text-zinc-400 font-semibold">Total Amount</span>
              <span className="text-2xl font-black text-amber-400">
                ₹{draft.totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </Section>
        </motion.div>

        {/* Lead Traveler */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="👤 Lead Traveler">
            <InfoRow label="Name" value={leadTraveler.name || "—"} />
            <InfoRow label="Email" value={leadTraveler.email || "—"} />
            <InfoRow label="Phone" value={leadTraveler.phone || "—"} />
          </Section>
        </motion.div>

        {/* All Travelers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title={`🧳 Travelers (${travelers.length})`}>
            <div className="space-y-5">
              {travelers.map((t, i) => (
                <div key={i} className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <span className="font-semibold">{t.fullName || `Traveler ${i + 1}`}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {[
                      ["Age", t.age ? `${t.age} yrs` : "—"],
                      ["Gender", t.gender || "—"],
                      ["Phone", t.phone || "—"],
                      ["Email", t.email || "—"],
                      [`${t.govIdType || "Gov ID"}`, t.govIdNumber || "—"],
                      ["Emergency", t.emergencyPhone || "—"],
                      ["Medical", t.medicalIssues || "None"],
                    ].map(([label, value]) => (
                      <div key={label} className="py-1">
                        <span className="text-zinc-500 text-xs block">{label}</span>
                        <span className="text-zinc-200 text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Vendor / Activity Breakdown */}
        {items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Section title="🗓️ Activity Breakdown & Vendors">
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 bg-zinc-900/60 rounded-xl p-4 border border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white capitalize">{item.category}</p>
                        <p className="text-amber-400 text-sm">{item.vendor}</p>
                        {item.city && (
                          <p className="text-zinc-500 text-xs mt-0.5">📍 {item.city}</p>
                        )}
                        {item.vendorPhone && (
                          <p className="text-zinc-500 text-xs">📞 {item.vendorPhone}</p>
                        )}
                        {item.vendorEmail && (
                          <p className="text-zinc-500 text-xs">✉️ {item.vendorEmail}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold">₹{item.price?.toLocaleString("en-IN")}</p>
                        {item.date && (
                          <p className="text-zinc-500 text-xs mt-1">
                            {new Date(item.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => router.push(`/checkout?draftId=${draftId}`)}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl text-lg tracking-wide transition-all shadow-lg shadow-amber-900/20"
          >
            Proceed to Payment →
          </button>
          <button
            onClick={() => router.push(`/traveler-details?draftId=${draftId}`)}
            className="w-full py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white font-semibold rounded-2xl text-sm transition-all"
          >
            ← Edit Traveler Details
          </button>
        </motion.div>

      </div>
    </div>
  );
}
