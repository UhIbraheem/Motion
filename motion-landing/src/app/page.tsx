import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center">
        <Image
          className="dark:invert"
          src="/logo-motion.svg" // Replace with your logo later
          alt="Motion App Logo"
          width={140}
          height={140}
          priority
        />

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Motion
        </h1>

        <p className="text-lg sm:text-xl max-w-xl text-gray-600 dark:text-gray-300">
          Discover AI-curated local adventures tailored to your vibe, schedule, and interests. Plan, book, and share with ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            className="bg-black text-white dark:bg-white dark:text-black rounded-full px-6 py-3 font-medium hover:opacity-90 transition"
            href="#"
          >
            Join Waitlist
          </a>
          <a
            className="border border-gray-400 dark:border-gray-600 rounded-full px-6 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            href="#"
          >
            Learn More
          </a>
        </div>
      </main>

      <footer className="row-start-3 text-sm text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} Motion. All rights reserved.
      </footer>
    </div>
  );
}
