export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 text-center mt-20">
      <h2 className="text-xl font-bold text-yellow-400">
        HumRahi Adventures
      </h2>
      <p className="text-sm text-gray-400 mt-2">
        AI Powered Travel Ecosystem © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
