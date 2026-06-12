"use client";

import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function VendorRegister() {

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          `${window.location.origin}/vendor/form`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <button
        onClick={handleGoogleLogin}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Continue with Google
      </button>

    </div>
  );
}