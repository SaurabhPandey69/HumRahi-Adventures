"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";
import { useRouter, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  useEffect(() => {
  if (document.getElementById("razorpay-script")) return;

  const script = document.createElement("script");
  script.id = "razorpay-script";
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();

  const draftId = searchParams.get("draftId");
  const [loading, setLoading] = useState(false);

  // 🔥 Fire checkout_view event
  useEffect(() => {
    if (!draftId) return;

    trackEvent("checkout_view", {
      page: "checkout",
      draftId,
    });
  }, [draftId]);

  // ❌ Block page if no draftId
  if (!draftId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Booking
          </h2>
          <p className="mb-6">
            No booking draft found. Please generate trip again.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ============================
  // 💳 RAZORPAY PAYMENT FLOW
  // ============================
  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create Razorpay order from backend
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });

      // ✅ YAHI ADD KARNA HAI
      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error("Order API Error:", errorText);
        alert("Server error while creating order");
        return;
      }

      const orderData = await orderRes.json();

      if (!orderData?.orderId) {
        alert("Failed to create payment order");
        return;
      }

      // 2️⃣ Load Razorpay script
      
        if (!window.Razorpay) {
          alert("Razorpay SDK failed to load");
          return;
        }
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "HumRahi Adventures",
          description: "Adventure Booking Payment",
          order_id: orderData.orderId,

          handler: async function (response: any) {
            // ✅ VERIFY PAYMENT (IMPORTANT 🔥)
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...response,
                draftId,
              }),
            });

            const result = await verifyRes.json();

            if (result.success) {
              await trackEvent("payment_success", {
                draftId,
                razorpay_payment_id: response.razorpay_payment_id,
              });

              router.push("/success");
            } else {
              alert("❌ Payment verification failed");
            }
          },
          
          modal: {
            ondismiss: function () {
              alert("Payment cancelled");
            },
          },

          prefill: {
            name: "Customer",
          },

          theme: {
            color: "#000000",
          },
        };

        const razor = new window.Razorpay(options);
        razor.open();

    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4">Checkout</h2>

        <p className="text-sm text-gray-500 mb-6">
          Draft ID: {draftId}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Pay Securely with Razorpay"}
        </button>
      </div>
    </div>
  );
}