"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/trackEvent";

import Locations from "@/components/Locations";
import AISection from "@/components/AISection";
import StoriesSection from "@/components/StoriesSection";
import SocialSection from "@/components/SocialSection";

export default function Home() {
  const handleClick = () => {
    trackEvent("click_book_now", { page: "home" });
  };

  return (
    <>
      {/* 🔥 HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-blue-500 to-purple-700 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to HumRahi Adventures 🌍
        </h1>

        <p className="mb-8 text-lg max-w-2xl">
          AI-Powered Paragliding & Adventure Experiences in 
          Bhadraj, Satpuli, Nainital & Khatu-Shayam Rajasthan.
          <br />
          Safe • Certified Pilots • 10,000+ Happy Flyers
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/book"
            onClick={handleClick}
            className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition"
          >
            Book Your Flight
          </Link>

          <Link
            href="/packages"
            className="border border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition"
          >
            View Packages
          </Link>
        </div>

        {/* ✅ ADMIN LOGIN BUTTON ADDED HERE */}
        <div className="text-center mt-10">
          <Link
            href="/admin/login"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Admin Login
          </Link>
        </div>
      </section>

      {/* 📍 LOCATIONS */}
      <Locations />

      {/* 🤖 AI SECTION */}
      <AISection />

      {/* ⭐ STORIES */}
      <StoriesSection />

      {/* 📺 SOCIAL */}
      <SocialSection />
    </>
  );
}
