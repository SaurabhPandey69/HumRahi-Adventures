"use client";

export default function VendorList({ vendors }: any) {
  const handleApprove = async (vendorId: string) => {
    await fetch("/api/admin/vendors/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });

    location.reload();
  };

  return (
    <>
      {vendors.map((vendor: any) => (
        <div key={vendor.id} className="border p-4 rounded mb-4">
          <p className="text-lg font-semibold">{vendor.name}</p>
          <p>City: {vendor.city}</p>
          <p>Category: {vendor.category}</p>
          <p>
            Status:{" "}
            {vendor.isApproved ? (
              <span className="text-green-600 font-semibold">
                Approved
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                Pending
              </span>
            )}
          </p>

          {!vendor.isApproved && (
            <button
              onClick={() => handleApprove(vendor.id)}
              className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            >
              Approve
            </button>
          )}
        </div>
      ))}
    </>
  );
}