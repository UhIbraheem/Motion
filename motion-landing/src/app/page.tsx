import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">Discover Life in Motion</h1>
        <p className="max-w-xl text-lg text-gray-600">
          Motion is your personal AI guide for curated local adventures. Whether you&rsquo;re chill or adventurous, Motion crafts experiences around your vibe.
        </p>
        <a
          href="#about"
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Learn More
        </a>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-6 text-center">About Motion</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Motion uses advanced AI to recommend personalized plans with real-time data from your local area. It&rsquo;s your pocket-sized concierge—no matter your diet, preferences, or mood.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            The app learns from your preferences and the community to deliver rich, meaningful suggestions. Filter by food, prayer times, noise levels, and more. Whether you're flying solo or planning with friends—Motion has you covered.
          </p>

          {/* Optional: Image row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <Image
              src="/sample-adventure.jpg"
              alt="Sample adventure"
              width={600}
              height={400}
              className="rounded-lg object-cover"
            />
            <Image
              src="/community-feed.jpg"
              alt="Community feed"
              width={600}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
