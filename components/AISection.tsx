"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AISection() {
  const router = useRouter();

  // ✅ OLD FORM + NEW bookingDate ADDED
  const [form, setForm] = useState({
    budget: "",
    duration: "",
    pickup: "",
    drop: "",
    stayType: "",
    groupSize: "",
    fearLevel: "",
    location: "",
    bookingDate: "", // ✅ NEW FIELD
    activities: [] as string[],
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleActivityChange = (activity: string, checked: boolean) => {
    if (checked) {
      setForm({
        ...form,
        activities: [...form.activities, activity],
      });
    } else {
      setForm({
        ...form,
        activities: form.activities.filter((a) => a !== activity),
      });
    }
  };

  const getRecommendation = async () => {
    // ✅ UPDATED VALIDATION (bookingDate added)
    if (
      !form.budget ||
      !form.duration ||
      !form.pickup ||
      !form.drop ||
      !form.stayType ||
      !form.groupSize ||
      !form.fearLevel ||
      !form.location ||
      !form.bookingDate // ✅ NEW VALIDATION
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResult(data);

      await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "ai_recommendation_generated",
          package: data.package,
          confidence: data.confidence,
          budget: form.budget,
          location: form.location,
          bookingDate: form.bookingDate, // ✅ Tracking booking date
        }),
      });

    } catch (error) {
      console.error("AI Error:", error);
      alert("AI recommendation failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Log Draft ID when result updates
  useEffect(() => {
    if (result?.draftId) {
      console.log("🔥 Draft ID:", result.draftId);
    }
  }, [result]);

  return (
    <section className="py-24 bg-black text-white text-center px-6">
      <h2 className="text-4xl font-bold mb-6">
        🤖 Build Your AI Adventure
      </h2>

      <p className="mb-10 text-gray-300 max-w-2xl mx-auto">
        Customize your trip — AI will design your perfect itinerary.
      </p>

      {/* FORM */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">

        <input
          name="budget"
          placeholder="Budget (₹)"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        />

        <input
          name="duration"
          placeholder="Duration (Days)"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        />

        <input
          name="pickup"
          placeholder="Pickup City"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        />

        <input
          name="drop"
          placeholder="Drop City"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        />

        <select
          name="stayType"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        >
          <option value="">Stay Type</option>
          <option value="Basic">Basic</option>
          <option value="Semi Luxury">Semi Luxury</option>
          <option value="Luxury">Luxury</option>
        </select>

        <input
          name="groupSize"
          placeholder="Group Size"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        />

        <select
          name="fearLevel"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        >
          <option value="">Fear Level</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          name="location"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        >
          <option value="">Select Location</option>
          <option value="Bhadraj">Bhadraj</option>
          <option value="Satpuli">Satpuli</option>
          <option value="Nainital">Nainital</option>
          <option value="Khatu-Shayam Rajasthan">
            Khatu-Shayam Rajasthan
          </option>
        </select>

        {/* ✅ NEW BOOKING DATE FIELD */}
        <input
          type="date"
          name="bookingDate"
          onChange={handleChange}
          className="p-3 rounded bg-white text-black w-52"
        />

      </div>

      {/* ACTIVITIES */}
      <div className="flex flex-wrap gap-4 justify-center mt-4 mb-8">
        {[
          "Rafting",
          "Camping",
          "Temple Trek",
          "Paragliding",
          "Dehradun Sightseeing",
          "Chakrata Extension",
        ].map((activity) => (
          <label
            key={activity}
            className="text-sm flex items-center gap-2 bg-gray-800 px-3 py-2 rounded"
          >
            <input
              type="checkbox"
              value={activity}
              onChange={(e) =>
                handleActivityChange(activity, e.target.checked)
              }
            />
            {activity}
          </label>
        ))}
      </div>

      <button
        onClick={getRecommendation}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3 rounded-lg transition"
      >
        {loading ? "Designing Your Trip..." : "Generate AI Trip Plan"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="mt-12 p-8 bg-white text-black shadow-xl rounded-xl max-w-2xl mx-auto text-left">
          <h3 className="text-2xl font-bold text-green-600 mb-4 text-center">
            🎯 {result.package}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><strong>💰 Price:</strong> ₹{result.price}</div>
            <div><strong>📅 Duration:</strong> {result.duration_days} Days</div>
            <div><strong>🚗 Pickup:</strong> {result.pickup_city}</div>
            <div><strong>🏁 Drop:</strong> {result.drop_city}</div>
            <div><strong>🏨 Stay:</strong> {result.stay_type}</div>
            <div>
              <strong>➕ Extension:</strong>{" "}
              {result.optional_extension ? "Available" : "No"}
            </div>
          </div>

          <div className="mb-4">
            <strong>🗺 Activities:</strong>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              {result.activities?.map((activity: string, index: number) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-gray-600 text-center">
            AI Confidence:{" "}
            {result.confidence > 1
              ? result.confidence
              : Math.round(result.confidence * 100)}
            %
          </div>

          <button
            onClick={() => {
              if (!result?.draftId) {
                alert("Draft not created. Please try again.");
                return;
              }

              router.push(`/checkout?draftId=${result.draftId}`);
            }}
            className="mt-6 bg-black text-white px-6 py-3 rounded-lg w-full hover:bg-gray-800 transition"
          >
            Book This Adventure
          </button>
        </div>
      )}
    </section>
  );
}