import { prisma } from "@/lib/prisma";
import AdminVendorForm from "./AdminVendorForm";
import VendorList from "./VendorList";

export default async function AdminVendors() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-10">

      {/* ✅ Add Vendor Form (UNCHANGED) */}
      <AdminVendorForm />

      {/* ✅ Vendor List Section */}
      <h2 className="text-2xl font-bold mb-6">All Vendors</h2>

      {/* ✅ Moved interactive logic to Client Component */}
      <VendorList vendors={vendors} />

    </div>
  );
}