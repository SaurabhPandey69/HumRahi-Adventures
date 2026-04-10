"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function VendorForm() {
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: "",
    category: "",
    city: "",
    basePrice: "",
    luxuryLevel: "",
    contactPhone: "",
    notes: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await fetch("/api/vendor/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        contactEmail: session?.user?.email,
      }),
    });

    alert("Vendor Registered Successfully!");
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl mb-6">Complete Vendor Profile</h2>

      <input name="name" placeholder="Vendor Name" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="city" placeholder="City" onChange={handleChange} />
      <input name="basePrice" placeholder="Base Price" onChange={handleChange} />
      <input name="luxuryLevel" placeholder="Luxury Level" onChange={handleChange} />
      <input name="contactPhone" placeholder="Phone" onChange={handleChange} />
      <textarea name="notes" placeholder="Notes" onChange={handleChange} />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}