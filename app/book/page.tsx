"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const activities = [
  "Paragliding",
  "River Rafting",
  "Camping",
  "Trekking",
  "Bungee Jumping",
  "Zipline",
  "Skiing",
  "Wildlife Safari",
  "Sightseeing",
  "Pilgrimage",
  "Road Trip",
  "Luxury Retreat",
];

export default function BookPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    groupSize: "2",
    luxuryLevel: "Mid Range",
    travelType: "Couple",
    duration: "3",
    medicalConditions: "",
    activities: [] as string[],
  });

  const toggleActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const generateAITrip = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data?.draftId) {
        alert("AI package generation failed ❌");
        return;
      }

      router.push(
        `/traveler-details?draftId=${data.draftId}`
      );

    } catch (error) {
      console.error(error);
      alert("Failed to generate AI package ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO */}
      <section className="relative px-6 py-20">

        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-500/20 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-full mb-6">
              <span className="text-cyan-400">●</span>
              <span className="text-sm text-zinc-300">
                AI Powered Travel Intelligence
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Plan Your
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {" "}Dream Adventure
              </span>
            </h1>

            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-2xl">
              HumRahi AI intelligently creates personalized travel itineraries
              using real-time vendor orchestration, AI recommendation engines,
              weather intelligence, dynamic pricing & activity optimization.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-3xl font-bold text-cyan-400">10K+</h3>
                <p className="text-zinc-400 text-sm mt-2">
                  AI Travel Recommendations
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-3xl font-bold text-purple-400">500+</h3>
                <p className="text-zinc-400 text-sm mt-2">
                  Verified Vendors
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                🤖
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  HumRahi AI Planner
                </h2>
                <p className="text-zinc-400 text-sm">
                  Personalized intelligent trip generation
                </p>
              </div>
            </div>

            <div className="space-y-5">

              {/* DESTINATION */}
              <div>
                <label className="block mb-2 text-sm text-zinc-400">
                  Destination
                </label>

                <input
                  type="text"
                  placeholder="Rishikesh, Kedarnath, Goa, Kashmir..."
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destination: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              {/* BUDGET */}
              <div>
                <label className="block mb-2 text-sm text-zinc-400">
                  Budget
                </label>

                <select
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
                >
                  <option value="">Select Budget</option>
                  <option value="Budget">Budget Friendly</option>
                  <option value="Mid Range">Mid Range</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Ultra Luxury">Ultra Luxury</option>
                </select>
              </div>

              {/* GRID */}
              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block mb-2 text-sm text-zinc-400">
                    Group Size
                  </label>

                  <input
                    type="number"
                    value={formData.groupSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groupSize: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-zinc-400">
                    Duration (Days)
                  </label>

                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              {/* LUXURY */}
              <div>
                <label className="block mb-2 text-sm text-zinc-400">
                  Luxury Level
                </label>

                <select
                  value={formData.luxuryLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      luxuryLevel: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
                >
                  <option>Basic</option>
                  <option>Mid Range</option>
                  <option>Premium</option>
                  <option>Luxury</option>
                  <option>Ultra Luxury</option>
                </select>
              </div>

              {/* TRAVEL TYPE */}
              <div>
                <label className="block mb-2 text-sm text-zinc-400">
                  Travel Type
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Family",
                    "Couple",
                    "Corporate",
                    "Solo",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          travelType: type,
                        })
                      }
                      className={`p-3 rounded-xl border transition ${
                        formData.travelType === type
                          ? "bg-cyan-500 border-cyan-500 text-black"
                          : "bg-zinc-900 border-zinc-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIVITIES */}
              <div>
                <label className="block mb-4 text-sm text-zinc-400">
                  Activities & Interests
                </label>

                <div className="flex flex-wrap gap-3">
                  {activities.map((activity) => {
                    const active =
                      formData.activities.includes(activity);

                    return (
                      <button
                        key={activity}
                        onClick={() => toggleActivity(activity)}
                        className={`px-4 py-2 rounded-full border text-sm transition ${
                          active
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400"
                            : "bg-zinc-900 border-zinc-700 hover:border-cyan-500"
                        }`}
                      >
                        {activity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MEDICAL */}
              <div>
                <label className="block mb-2 text-sm text-zinc-400">
                  Medical Conditions / Special Requirements
                </label>

                <textarea
                  placeholder="Mention injuries, surgeries, asthma, motion sickness, etc..."
                  value={formData.medicalConditions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medicalConditions: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 h-28 resize-none"
                />
              </div>

              {/* BUTTON */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={generateAITrip}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-lg font-bold shadow-2xl"
              >
                {loading
                  ? "Generating AI Adventure..."
                  : "Generate AI Adventure 🚀"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
