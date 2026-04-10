"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export default function VendorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);

  const [availability, setAvailability] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const [manualDate, setManualDate] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  // ✅ NEW STATES (ADDED)
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/vendor/login");
        return;
      }

      setUser(data.user);

      const res = await fetch(
        `/api/vendor/me?authUserId=${data.user.id}`
      );

      const vendorData = await res.json();

      if (!vendorData.exists) {
        router.push("/vendor/complete-registration");
        return;
      }

      if (!vendorData.vendor.profileCompleted) {
        router.push("/vendor/complete-registration");
        return;
      }

      setVendor(vendorData.vendor);

      await fetchAvailability(vendorData.vendor.id);
      await fetchBookings(vendorData.vendor.id);
    };

    load();
  }, [router]);

  const fetchAvailability = async (vendorId: string) => {
    const res = await fetch(
      `/api/vendor/availability?vendorId=${vendorId}`
    );
    const data = await res.json();
    setAvailability(data);
  };

  const fetchBookings = async (vendorId: string) => {
    try {
      const res = await fetch(
        `/api/vendor/bookings?vendorId=${vendorId}`
      );
      const data = await res.json();
      setBookings(data);
    } catch {
      setBookings([]);
    }
  };

  // ✅ NEW FUNCTION (ADDED)
  const loadBookings = async () => {
    const res = await fetch(`/api/vendor/bookings?vendorId=${vendor.id}`);
    const data = await res.json();
    setBookings(data);
  };

  // ✅ NEW useEffect (ADDED)
  useEffect(() => {
    if (vendor) {
      loadBookings();
    }
  }, [vendor]);

  const formatDate = (date: Date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const availabilityEvents = availability.map((a) => {
    const endDate = new Date(a.date);
    endDate.setDate(endDate.getDate() + 1);

    const formattedEnd =
      endDate.getFullYear() +
      "-" +
      String(endDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(endDate.getDate()).padStart(2, "0");

    return {
      start: a.date,
      end: formattedEnd,
      display: "background",
      color: a.available ? "#bbf7d0" : "#fecaca",
    };
  });

  const bookingEvents = bookings.map((b, i) => {
  // 🔥 fallback start date
  const startDate = b.startDate || b.date;

  // 🔥 FIX: end date handling
  let endDate = b.endDate || b.date;

  const endObj = new Date(endDate);
  endObj.setDate(endObj.getDate() + 1); // ✅ FIX (exclusive end)

  const formattedEnd =
    endObj.getFullYear() +
    "-" +
    String(endObj.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(endObj.getDate()).padStart(2, "0");

  return {
    title: b.name || b.userName, // ✅ keep both support
    start: startDate,
    end: formattedEnd, // ✅ FIXED
    extendedProps: {
      avatar: b.avatar || "https://i.pravatar.cc/30",
      phone: b.phone || "N/A", // 🔥 ADD THIS
      id: b.id, // 🔥 IMPORTANT
      status: b.status,
      rejectReason: b.rejectReason,
    },
    color: b.vendorColor || ["#ef4444", "#3b82f6", "#eab308"][i % 3],
  };
});

  const allEvents = [...availabilityEvents, ...bookingEvents];

  const handleDateClick = async (info: any) => {
    const date = new Date(info.dateStr);

    await fetch("/api/vendor/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorId: vendor.id,
        date: formatDate(date),
        available: true,
      }),
    });

    await fetchAvailability(vendor.id);

    if (!rangeStart) {
      setRangeStart(date);
    } else {
      setRangeEnd(date);
    }
  };

  const handleDateSelectRange = async (info: any) => {
    const confirmAction = confirm("Mark this range as available?");
    if (!confirmAction) return;

    const endDate = new Date(info.endStr);
    endDate.setDate(endDate.getDate() - 1);

    const formattedEnd =
      endDate.getFullYear() +
      "-" +
      String(endDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(endDate.getDate()).padStart(2, "0");

    await fetch("/api/vendor/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorId: vendor.id,
        startDate: info.startStr,
        endDate: formattedEnd,
        available: true,
      }),
    });

    await fetchAvailability(vendor.id);
  };

  const applyRange = async (available: boolean) => {
    if (!rangeStart || !rangeEnd) {
      alert("Select range first");
      return;
    }

    await fetch("/api/vendor/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorId: vendor.id,
        startDate: formatDate(rangeStart),
        endDate: formatDate(rangeEnd),
        available,
      }),
    });

    setRangeStart(null);
    setRangeEnd(null);

    await fetchAvailability(vendor.id);
  };

  const markManualAvailable = async () => {
    if (!manualDate) return alert("Select date");

    await fetch("/api/vendor/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorId: vendor.id,
        date: manualDate,
        available: true,
      }),
    });

    await fetchAvailability(vendor.id);
  };

  const applyManualRange = async (available: boolean) => {
    if (!startDateInput || !endDateInput) {
      return alert("Select both dates");
    }

    await fetch("/api/vendor/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorId: vendor.id,
        startDate: startDateInput,
        endDate: endDateInput,
        available,
      }),
    });

    await fetchAvailability(vendor.id);
  };

// 🔥 Mark Completed
const markCompleted = async (bookingId: string) => {
  try {
    const res = await fetch("/api/vendor/mark-completed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Booking marked as completed");
      window.location.reload();
    } else {
      alert("❌ Failed to update");
    }
  } catch (err) {
    console.error(err);
    alert("Error updating booking");
  }
};  

// 🔥 CANCEL
const cancelBooking = async () => {
  if (!selectedBooking?.id) return;

  const reason = prompt("Enter cancellation reason");

  if (!reason) return;

  await fetch("/api/booking/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: selectedBooking.id,
      status: "CANCEL_REQUESTED", // 🔥 NOT CANCELLED
      cancelReason: reason,
      cancelRequested: true,
    }),
  });

  setShowModal(false);
  await loadBookings();
};

// 🔥 WHATSAPP
const openWhatsApp = () => {
  const phone = selectedBooking?.phone;
  if (!phone) return;

  window.open(`https://wa.me/${phone}`, "_blank");
};

// 🔥 EDIT
const editBooking = async () => {
  const newName = prompt("Enter new name", selectedBooking.title);
  if (!newName) return;

  await fetch("/api/booking/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: selectedBooking.id,
      userName: newName,
    }),
  });

  setShowModal(false);
  await loadBookings();
};

  const renderEventContent = (eventInfo: any) => {
    const avatar = eventInfo.event.extendedProps.avatar;

    return (
      <div
        className="flex items-center gap-1"
        data-tooltip-id="booking-tooltip"
        data-tooltip-content={`${eventInfo.event.title}
Check-in: ${eventInfo.event.startStr}
Check-out: ${eventInfo.event.endStr}`}
      >
        <img src={avatar} className="w-5 h-5 rounded-full" />
        <span className="text-xs">{eventInfo.event.title}</span>
      </div>
    );
  };

  const handleEventClick = (info: any) => {
    const booking = info.event;

    setSelectedBooking({
    id: booking.extendedProps?.id, // 🔥 IMPORTANT  
    title: booking.title,
    start: booking.startStr,
    end: booking.endStr,
    phone: booking.extendedProps?.phone || "N/A",
    status: booking.extendedProps?.status,
    rejectReason: booking.extendedProps?.rejectReason,  
  });

    setShowModal(true);
  };

  if (!user || !vendor) return <p className="p-10">Loading...</p>;

  if (!vendor.isApproved) {
    return (
      <div className="p-10">
        <h2 className="text-xl font-semibold">
          Waiting for Admin Approval
        </h2>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Welcome {vendor.name}
      </h1>

      <p className="text-gray-600 mb-6">
        Logged in as: {user.email}
      </p>

      {/* 🔥 MANUAL DATE */}
      <div className="border p-4 rounded mb-6">
        <input
          type="date"
          value={manualDate}
          onChange={(e) => setManualDate(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={markManualAvailable}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Mark Available
        </button>
      </div>

      {/* 🔥 RANGE INPUT */}
      <div className="border p-4 rounded mb-6">
        <input
          type="date"
          value={startDateInput}
          onChange={(e) => setStartDateInput(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="date"
          value={endDateInput}
          onChange={(e) => setEndDateInput(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={() => applyManualRange(true)}
          className="bg-green-600 text-white px-4 py-2 mr-2 rounded"
        >
          Available
        </button>
        <button
          onClick={() => applyManualRange(false)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Unavailable
        </button>
      </div>

      {/* 📅 CALENDAR */}
      <div className="border p-6 rounded">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={allEvents}
          dateClick={handleDateClick}
          select={handleDateSelectRange}
          eventClick={handleEventClick}
          selectable={true}
          eventContent={renderEventContent}
          headerToolbar={{
            left: "prevYear,prev,next,nextYear",
            center: "title",
            right: "today"
          }}
          initialDate={new Date()}
          height="auto"
        />
      </div>

      {/* 🔥 LEGEND BELOW */}
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200"></div> Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200"></div> Unavailable
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500"></div> Bookings
        </div>
      </div>

      {/* ✅ NEW UI (BOOKINGS LIST) */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Your Bookings
        </h2>

        {bookings.map((b) => (
          <div key={b.id} className="border p-3 mb-2 rounded">
            <p><b>{b.userName}</b></p>
            <p>{new Date(b.date).toDateString()}</p>
            <p>{b.phone}</p>
            <p>Status: {b.status}</p>
            {b.rejectReason && (
              <p className="text-red-500">
                Reason: {b.rejectReason}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
{showModal && selectedBooking && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    
    <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
      
      <h2 className="text-lg font-semibold mb-4">
        Booking Details
      </h2>

      <p className="mb-2">
        <b>Name:</b> {selectedBooking.title}
      </p>

      <p className="mb-2">
        <b>Phone:</b> {selectedBooking.phone}
      </p>

      <p className="mb-4">
        <b>Date:</b>{" "}
        {new Date(selectedBooking.start).toDateString()}
      </p>

      <p className="mb-2">
        <b>Status:</b> {selectedBooking.status}
      </p>

      {selectedBooking.rejectReason && (
        <p className="text-red-600 mb-2">
          <b>Reject Reason:</b> {selectedBooking.rejectReason}
        </p>
      )}

      {/* 🔥 NEW BUTTONS */}
      <div className="flex flex-col gap-2 mt-4">

        <button
          onClick={openWhatsApp}
          className="bg-green-600 text-white py-2 rounded"
        >
          WhatsApp
        </button>

        <button
          onClick={() => markCompleted(booking.id)}
          className="bg-blue-600 text-white py-2 rounded"
        >
          Mark Completed
        </button>

        <button
          onClick={editBooking}
          className="bg-yellow-500 text-white py-2 rounded"
        >
          Edit
        </button>

        <button
          onClick={cancelBooking}
          className="bg-red-600 text-white py-2 rounded"
        >
          Cancel Booking
        </button>

        <button
          onClick={() => setShowModal(false)}
          className="bg-black text-white py-2 rounded"
        >
          Close
        </button>

      </div>

    </div>
  </div>
)}

      <Tooltip id="booking-tooltip" />
    </div>
  );
}

