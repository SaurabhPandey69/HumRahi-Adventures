export default function StoriesSection() {
  return (
    <section className="py-20 bg-gray-50 text-center">
      <h2 className="text-4xl font-bold mb-12">
        Stories From Our Flyers ✨
      </h2>

      <div className="grid md:grid-cols-3 gap-6 px-6">
        <div className="bg-white p-6 rounded shadow">
          <p>"Best experience of my life!"</p>
          <h4 className="mt-4 font-semibold">– Rahul</h4>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p>"Super safe and professional pilots."</p>
          <h4 className="mt-4 font-semibold">– Anjali</h4>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p>"Worth every rupee."</p>
          <h4 className="mt-4 font-semibold">– Karan</h4>
        </div>
      </div>
    </section>
  );
}
