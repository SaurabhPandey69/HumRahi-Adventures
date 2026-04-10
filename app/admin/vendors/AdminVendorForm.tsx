"use client";

import { useState } from "react";

export default function AdminVendorForm() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    city: "",
    basePrice: "",
    pricePerPerson: true,
    luxuryLevel: "",
    capacity: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    autoBookingSupported: false,
    notes: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔥 UPDATED HANDLE SUBMIT (SAFE UPGRADE)
  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/admin/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // 🔴 CASE 3 — Vendor already exists
      if (!res.ok) {
        alert(data.error);
        return;
      }

      // 🟡 CASE 2 — User already exists in Supabase
      if (data.isExistingUser) {
        alert("User already registered. Ask them to login.");
      } else {
        // 🟢 CASE 1 — New invite
        alert("Invite sent successfully");
      }

      // 🔄 Optional reload (unchanged behavior)
      location.reload();

    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong ❌");
    }
  };

  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold mb-6">Add Vendor</h1>

      <div className="grid grid-cols-2 gap-4">
        <input name="name" placeholder="Vendor Name" onChange={handleChange} className="border p-2" />
        <input name="category" placeholder="Category" onChange={handleChange} className="border p-2" />
        <input name="city" placeholder="City" onChange={handleChange} className="border p-2" />
        <input name="basePrice" placeholder="Base Price" onChange={handleChange} className="border p-2" />

        <select name="luxuryLevel" onChange={handleChange} className="border p-2">
          <option value="">Luxury Level</option>
          <option value="Basic">Basic</option>
          <option value="Semi">Semi</option>
          <option value="Luxury">Luxury</option>
        </select>

        <input name="capacity" placeholder="Capacity" onChange={handleChange} className="border p-2" />
        <input name="contactName" placeholder="Contact Name" onChange={handleChange} className="border p-2" />
        <input name="contactPhone" placeholder="Contact Phone" onChange={handleChange} className="border p-2" />
        <input name="contactEmail" placeholder="Contact Email" onChange={handleChange} className="border p-2" />

        <label className="flex items-center gap-2">
          <input type="checkbox" name="pricePerPerson" onChange={handleChange} />
          Price Per Person
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="autoBookingSupported" onChange={handleChange} />
          Auto Booking Supported
        </label>

        <textarea name="notes" placeholder="Notes" onChange={handleChange} className="border p-2 col-span-2" />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-black text-white px-6 py-3 rounded"
      >
        Save Vendor
      </button>
    </div>
  );
}
