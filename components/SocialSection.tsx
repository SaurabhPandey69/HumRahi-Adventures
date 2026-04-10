export default function SocialSection() {
  return (
    <section className="py-20 bg-black text-white text-center">
      <h2 className="text-4xl font-bold mb-8">
        Follow Our Adventures
      </h2>

      <div className="flex justify-center gap-6">
        <a
          href="https://youtube.com/"
          target="_blank"
          className="bg-red-600 px-6 py-3 rounded"
        >
          YouTube
        </a>

        <a
          href="https://instagram.com/"
          target="_blank"
          className="bg-pink-500 px-6 py-3 rounded"
        >
          Instagram
        </a>
      </div>
    </section>
  );
}
