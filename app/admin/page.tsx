// "use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { getAdminStats } from "@/lib/analytics";
import { getFunnelStats } from "@/lib/funnel";
import { getHotLeads } from "@/lib/automation";
// import { useRouter } from "next/navigation";

export default async function AdminPage() {
  const stats = await getAdminStats();
  const funnel = await getFunnelStats();
  const hotLeads = await getHotLeads();
  // const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-10">

      {/* 🔝 TOP HEADER + NAV BUTTONS + LOGOUT */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

        <h1 className="text-3xl font-bold">
          HumRahi Adventures Admin Dashboard
        </h1>

        <div className="flex gap-4 flex-wrap items-center">
          <Link
            href="/admin"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            📊 Admin Dashboard
          </Link>

        
         <div className="mt-6 flex gap-4">
            <Link
              href="/admin/bookings"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block"
            >
              View Bookings
            </Link>
            
            <Link
                href="/admin/vendors"
                className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition"
              >
                🏢 Vendor Management
              </Link>

              <LogoutButton />
          
          </div> 
        </div>
      </div>

      {/* ===================== */}
      {/* TOP METRICS */}
      {/* ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Stat title="Visits" value={stats.totalVisits} />
        <Stat title="Leads" value={stats.totalLeads} />
        <Stat title="Payments" value={stats.totalPayments} />
        <Stat title="Revenue (₹)" value={stats.revenue} />
        <Stat title="Conversion %" value={stats.conversion} />
      </div>

      {/* ===================== */}
      {/* FUNNEL SECTION */}
      {/* ===================== */}
      <div className="rounded-xl border p-6 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Funnel Analysis</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat title="Visits" value={funnel.visits} />
          <Stat title="Leads" value={funnel.leads} />
          <Stat title="Checkout" value={funnel.checkouts} />
          <Stat title="Payments" value={funnel.payments} />
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <p>Drop: Visit → Lead = {funnel.dropVisitToLead}</p>
          <p>Drop: Lead → Checkout = {funnel.dropLeadToCheckout}</p>
          <p>Drop: Checkout → Payment = {funnel.dropCheckoutToPayment}</p>
          <p className="font-bold">
            Overall Conversion: {funnel.conversion}%
          </p>
        </div>
      </div>

      {/* ===================== */}
      {/* HOT LEADS SECTION */}
      {/* ===================== */}
      <div className="rounded-xl border p-6 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4 text-red-500">
          🔥 Hot Leads (30+ min no payment)
        </h2>

        {hotLeads.length === 0 ? (
          <p>No hot leads 🎉</p>
        ) : (
          hotLeads.map((lead) => (
            <div key={lead.id} className="border p-3 mb-2 rounded text-sm">
              <p><strong>ID:</strong> {lead.id}</p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border p-4 shadow-sm bg-white">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
