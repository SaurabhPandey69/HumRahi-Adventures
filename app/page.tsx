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

  <div className="mb-4">
    <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
      🚀 AI-Powered Travel Ecosystem
    </span>
  </div>

  <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-5xl">
    Discover Adventures, Find Travel Buddies &
    Plan Smarter Trips with AI 🌍
  </h1>

  <p className="mb-8 text-lg max-w-3xl">
    HumRahi is an AI-powered travel ecosystem that helps travelers discover
    destinations, adventures, generate and create personalized itineraries, find like-minded travel companions, 
    and plan unforgettable adventures together through intelligent recommendations and community-driven experiences, 
    connect with compatible travel buddies, join travel communities, and explore unforgettable
    experiences across India.
  </p>

  <div className="flex gap-4 flex-wrap justify-center">

```
<Link
  href="/book"
  onClick={handleClick}
  className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition"
>
  Plan My Trip
</Link>

<Link
  href="/book"
  className="border border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition"
>
  Explore Adventures
</Link>
```

  </div>

  <div className="mt-8 text-sm md:text-base opacity-90">
    ✈️ AI Trip Planning • 🤝 Travel Buddy Matching • 🏕️ Adventure Experiences • 💬 Travel Communities
  </div>

  <div className="text-center mt-10">
    <Link
      href="/admin/login"
      className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
    >
      Admin Login
    </Link>
  </div>

</section>

{/* 🚀 FUTURE OF HUMRAHI */}

<section className="py-16 px-6 bg-gray-50">
  <div className="max-w-6xl mx-auto text-center">

```
<h2 className="text-4xl font-bold mb-4">
  The Future of Travel Starts Here
</h2>

<p className="text-gray-600 max-w-3xl mx-auto mb-12">
  HumRahi is evolving into an AI-powered travel ecosystem that
  helps travelers discover destinations, find compatible travel
  buddies, connect with communities, and plan trips together.
</p>

<div className="grid md:grid-cols-3 gap-8">

  <div className="bg-white p-6 rounded-xl shadow">
    <h3 className="font-bold text-xl mb-3">
      🤝 Travel Buddy Matching
    </h3>
    <p>
      Match with travelers based on destination preferences,
      travel style, interests and budget.
    </p>
  </div>

  <div className="bg-white p-6 rounded-xl shadow">
    <h3 className="font-bold text-xl mb-3">
      🤖 AI Travel Assistant
    </h3>
    <p>
      Get personalized itineraries, recommendations and smart
      trip planning powered by AI.
    </p>
  </div>

  <div className="bg-white p-6 rounded-xl shadow">
    <h3 className="font-bold text-xl mb-3">
      💬 Travel Communities
    </h3>
    <p>
      Connect, chat and plan adventures with like-minded
      travelers from around the world.
    </p>
  </div>

</div>
```

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
