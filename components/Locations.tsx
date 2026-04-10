const locations = [
  { name: "Bhadraj Temple", state: "Uttarakhand" },
  { name: "Satpuli", state: "Uttarakhand" },
  { name: "Nainital", state: "Uttarakhand" },
  { name: "Rajasthan Motor", state: "Rajasthan (Coming Soon)" },
];

export default function Locations() {
  return (
    <section className="py-20 bg-gray-100 text-center">
      <h2 className="text-4xl font-bold mb-12">Our Locations</h2>

      <div className="grid md:grid-cols-4 gap-6 px-6">
        {locations.map((loc, i) => (
          <div key={i} className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold">{loc.name}</h3>
            <p className="text-gray-600">{loc.state}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
