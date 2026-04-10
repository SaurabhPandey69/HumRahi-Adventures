"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
