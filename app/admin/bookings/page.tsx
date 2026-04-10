"use client";

import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);  
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");

  const loadData = async () => {
    // 🔥 all bookings
    const bookingsRes = await fetch("/api/admin/bookings");
    const bookingsData = await bookingsRes.json();

    // 🔥 cancel requests
    const res = await fetch("/api/admin/cancel-requests");
    const data = await res.json();

    setBookings(bookingsData.bookings || []);
    setRequests(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveCancel = async (id: string) => {
    await fetch("/api/booking/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status: "CANCELLED",
      }),
    });

    loadData();
  };

  return (
    <div className="p-10">
       <h1 className="text-xl font-bold mb-4">
        All Bookings
        </h1>

        <div className="flex gap-3 mb-4">
            {["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"].map((f) => (
                <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded ${
                    filter === f ? "bg-black text-white" : "bg-gray-200"
                }`}
                >
                {f}
                </button>
            ))}
            </div>

        <div className="mb-4">
            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border px-4 py-2 rounded"
            >
                <option value="ALL">All</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
            </select>
            </div>

        {bookings
            .filter((b) => {
                if (filter === "ALL") return true;
                return b.status === filter;
            })
            .map((b) => (
        <div key={b.id} className="border p-4 mb-3 rounded bg-gray-50">
            <p><b>{b.userName}</b></p>
            <p>📞 {b.phone}</p>
            <p>📅 {new Date(b.date).toDateString()}</p>
            <p>Status: <b>{b.status}</b></p>

            {b.status === "CONFIRMED" && (
            <span className="text-green-600">Active Booking</span>
            )}

            {b.status === "COMPLETED" && (
            <span className="text-blue-600">Completed</span>
            )}

            {b.status === "CANCELLED" && (
            <span className="text-red-600">Cancelled</span>
            )}
        </div>
        ))} 

      <h1 className="text-xl font-bold mt-10 mb-4">
        Cancel Requests
      </h1>

      {requests.map((b) => (
        <div key={b.id} className="border p-4 mb-3 rounded">
          <p><b>{b.userName}</b></p>
          <p>{new Date(b.date).toDateString()}</p>
          <p>Reason: {b.cancelReason}</p>

          <button
            onClick={() => approveCancel(b.id)}
            className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
          >
            Approve Cancel
          </button>

          <button
            onClick={async () => {
                const reason = prompt("Enter reject reason");
                if (!reason) return;

                await fetch("/api/booking/update", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: b.id,
                        status: "CONFIRMED", // 🔥 revert back
                        rejectReason: reason,
                        cancelRequested: false,
                    }),
                });

                loadData();
            }}
            className="bg-red-600 text-white px-4 py-2 mt-2 ml-2 rounded"
            >
                Reject
            </button>
        </div>
      ))}
    </div>
  );
}