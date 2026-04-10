export default function Hero() {
  return (
    <section className="h-screen bg-black text-white flex flex-col justify-center items-center text-center px-6">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        Fly Above The Mountains 🪂
      </h1>

      <p className="text-lg max-w-2xl mb-8">
        Experience Paragliding in Bhadraj, Satpuli, Nainital & Rajasthan.
        Safe • Certified Pilots • 10,000+ Happy Flyers
      </p>

      <div className="flex gap-4">
        <a
          href="/book"
          className="bg-yellow-500 px-6 py-3 rounded text-black font-semibold"
        >
          Book Now
        </a>

        <a
          href="/packages"
          className="border border-white px-6 py-3 rounded"
        >
          View Packages
        </a>
      </div>
    </section>
  );
}
