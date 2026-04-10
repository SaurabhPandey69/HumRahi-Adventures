"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo + Tagline */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex flex-col leading-tight"
        >
          <span className="text-2xl font-bold text-yellow-500">
            HumRahi Adventures
          </span>
          <span className="text-xs text-gray-400">
            Powered by HumRahi AI
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 font-medium text-sm">
          <Link href="/" className="hover:text-yellow-400 transition">
            Home
          </Link>

          <Link href="/packages" className="hover:text-yellow-400 transition">
            Packages
          </Link>

          <Link href="/safety" className="hover:text-yellow-400 transition">
            Safety
          </Link>

          <Link href="/book" className="hover:text-yellow-400 transition">
            Book
          </Link>

          {/* ✅ ADMIN LOGIN LINK */}
          <Link href="/admin/login" className="hover:text-yellow-400 transition">
            Admin
          </Link>
        </div>

        {/* Burger Button (Mobile) */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black border-t border-gray-800 flex flex-col text-center py-6 gap-6 text-sm font-medium">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>

          <Link href="/packages" onClick={() => setOpen(false)}>
            Packages
          </Link>

          <Link href="/safety" onClick={() => setOpen(false)}>
            Safety
          </Link>

          <Link href="/book" onClick={() => setOpen(false)}>
            Book
          </Link>

          {/* ✅ ADMIN LOGIN LINK (Mobile) */}
          <Link href="/admin/login" onClick={() => setOpen(false)}>
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
