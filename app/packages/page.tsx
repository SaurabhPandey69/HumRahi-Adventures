// app/packages/page.tsx

export default function Packages() {
  const recommended = "Sky Elite"; // temporary (AI se dynamic aayega later)

  return (
    <div className="p-10 max-w-4xl mx-auto">
      
      <h1 className="text-4xl font-bold mb-6">
        Explore HumRahi Adventure Packages
      </h1>

      <ul className="space-y-6 text-gray-700 text-lg">

        {/* Sky Starter */}
        <li className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition relative">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-xl">Sky Starter</strong>

              {recommended === "Sky Starter" && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded ml-3">
                  Best for You
                </span>
              )}
            </div>

            <span className="font-semibold">₹2500</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Perfect for first-time flyers. Smooth take-off & safe landing.
          </p>
        </li>


        {/* Sky Elite */}
        <li className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition relative">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-xl">Sky Elite</strong>

              {recommended === "Sky Elite" && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded ml-3">
                  Best for You
                </span>
              )}
            </div>

            <span className="font-semibold">₹3500</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Extended flight time with scenic aerial views & GoPro recording.
          </p>
        </li>


        {/* Sky Royale */}
        <li className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition relative">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-xl">Sky Royale</strong>

              {recommended === "Sky Royale" && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded ml-3">
                  Best for You
                </span>
              )}
            </div>

            <span className="font-semibold">₹5500</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Premium experience with longest airtime + priority slot booking.
          </p>
        </li>

      </ul>
    </div>
  );
}
