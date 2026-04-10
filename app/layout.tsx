import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // ✅ Footer import added
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HumRahi Adventures | AI Powered Adventure Travel",
  description:
    "Book Paragliding, Motor Paragliding & Adventure Experiences powered by HumRahi AI",
  keywords: [
    "Paragliding India",
    "Motor Paragliding Rajasthan",
    "Bhadraj Paragliding",
    "Nainital Paragliding",
    "Adventure Sports India",
    "AI Travel Platform",
    "HumRahi Adventures",
  ],
  openGraph: {
    title: "HumRahi Adventures",
    description:
      "AI Powered Paragliding & Adventure Experiences across India",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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

