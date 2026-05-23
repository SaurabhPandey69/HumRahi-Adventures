"use client";

import { motion } from "framer-motion";

const packages = [
  {
    title: "AI Adventure Trails",
    price: "Starting ₹4,999",
    icon: "🏔️",
    description:
      "AI-crafted trekking, rafting, camping & adventure sports itineraries.",
    features: [
      "Trekking",
      "Camping",
      "River Rafting",
      "Paragliding",
      "Bonfire",
    ],
  },

  {
    title: "AI Pilgrimage Journeys",
    price: "Starting ₹6,999",
    icon: "🛕",
    description:
      "Spiritual tours with smart crowd prediction & optimized temple visits.",
    features: [
      "Kedarnath",
      "Badrinath",
      "Rishikesh",
      "Haridwar",
      "VIP Darshan Planning",
    ],
  },

  {
    title: "AI Luxury Escapes",
    price: "Starting ₹12,999",
    icon: "🏨",
    description:
      "Luxury stays, premium transportation & personalized experiences.",
    features: [
      "Luxury Hotels",
      "Private Cabs",
      "Premium Dining",
      "Scenic Tours",
    ],
  },

  {
    title: "AI Backpacking Tours",
    price: "Starting ₹3,499",
    icon: "🎒",
    description:
      "Budget-friendly smart travel experiences optimized using AI.",
    features: [
      "Hostels",
      "Group Trips",
      "Budget Transport",
      "Local Exploration",
    ],
  },

  {
    title: "AI Wildlife Expeditions",
    price: "Starting ₹7,499",
    icon: "🦁",
    description:
      "Nature & wildlife exploration packages with AI-guided planning.",
    features: [
      "Safari",
      "Nature Trails",
      "Photography",
      "Forest Stay",
    ],
  },

  {
    title: "AI Extreme Sports",
    price: "Starting ₹8,999",
    icon: "🪂",
    description:
      "High-adrenaline adventures powered by AI safety & weather analysis.",
    features: [
      "Paragliding",
      "Bungee Jumping",
      "Zipline",
      "Skiing",
      "ATV Rides",
    ],
  },

  {
    title: "AI Family Vacations",
    price: "Starting ₹9,999",
    icon: "👨‍👩‍👧‍👦",
    description:
      "Family-friendly personalized tours with child-safe experiences.",
    features: [
      "Sightseeing",
      "Hotels",
      "Transport",
      "Family Activities",
    ],
  },

  {
    title: "AI Corporate Retreats",
    price: "Starting ₹15,999",
    icon: "🏢",
    description:
      "Corporate offsites, team bonding & leadership retreats.",
    features: [
      "Team Activities",
      "Luxury Resorts",
      "Conference Setup",
      "Adventure Events",
    ],
  },

  {
    title: "AI Cultural Explorations",
    price: "Starting ₹5,999",
    icon: "🎭",
    description:
      "Experience heritage, local food, traditions & cultural immersion.",
    features: [
      "Food Tours",
      "Heritage Walks",
      "Local Markets",
      "Traditional Events",
    ],
  },

  {
    title: "AI Custom Travel Planner",
    price: "Dynamic Pricing",
    icon: "🤖",
    description:
      "Fully AI-generated personalized itineraries using LangChain agents, RAG pipelines & real-time vendor orchestration.",
    features: [
      "AI Recommendations",
      "Dynamic Itinerary",
      "Smart Pricing",
      "Vendor Matching",
      "Weather Intelligence",
      "Real-time Availability",
    ],
  },
];

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            AI Powered Travel Experiences 🌍
          </h1>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Intelligent travel planning powered by AI agents, dynamic itinerary generation,
            personalized recommendations, real-time vendor orchestration &
            smart activity optimization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl"
            >
              <div className="text-5xl mb-5">
                {pkg.icon}
              </div>

              <h2 className="text-2xl font-bold mb-3">
                {pkg.title}
              </h2>

              <p className="text-gray-400 mb-5">
                {pkg.description}
              </p>

              <div className="text-green-400 font-bold text-xl mb-6">
                {pkg.price}
              </div>

              <div className="space-y-2 mb-8">
                {pkg.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-800 px-3 py-2 rounded-lg text-sm"
                  >
                    ✅ {feature}
                  </div>
                ))}
              </div>

              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl font-semibold hover:opacity-90 transition">
                Explore Package
              </button>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  );
}