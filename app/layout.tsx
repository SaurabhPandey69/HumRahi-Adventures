import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // ✅ Footer import added
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
metadataBase: new URL("https://www.aihumrahiadventure.com"),

title:
"HumRahi | AI-Powered Travel Ecosystem & Travel Buddy Network",

description:
"HumRahi is an AI-powered travel ecosystem that helps travelers discover adventures, plan personalized trips, find compatible travel buddies, join travel communities, chat with fellow explorers, and create unforgettable travel experiences through intelligent recommendations and smart trip planning.",

robots: {
index: true,
follow: true,
},

keywords: [
"HumRahi",
"AI Travel Ecosystem",
"Travel Buddy Network",
"Travel Buddy Matching",
"Find Travel Buddies",
"Travel Partner Finder",
"Solo Travel Community",
"AI Travel Planner",
"Travel Recommendations",
"Travel Matching Platform",
"Travel Community",
"Travel Social Network",
"Group Travel Planning",
"Travel Companion Finder",
"Adventure Travel India",
"Travel Networking Platform",
"Trip Planning Platform",
"Travel Chat Platform",
"AI Trip Planner",
"Personalized Travel Planning",
"Travel Marketplace",
"Travel Experiences",
"Community Driven Travel",
"Adventure Booking Platform",
"Trekking India",
"Camping India",
"Paragliding India",
"Weekend Getaways India",
"Generative AI Travel",
"Travel Recommendation Engine",
"RAG Travel Assistant",
"Travel AI Assistant",
"Travel Friends Finder",
"Travel Groups",
"Travel Community India",
"Travel Collaboration Platform"
],

openGraph: {
title:
"HumRahi Adventures | AI-Powered Travel Ecosystem & Travel Buddy Network",


description:
  "Plan smarter trips with AI, discover adventures, find travel buddies, join travel communities, chat with fellow travelers, and get personalized travel recommendations across India.",

type: "website",

},
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-white text-black">
        <Navbar />

        <main className="pt-20">
          {children}
        </main>

        <Footer /> {/* ✅ Footer correctly placed */}
      </body>
    </html>
  );
}

