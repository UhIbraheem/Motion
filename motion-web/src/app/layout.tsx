import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Motion - AI-Powered Local Adventures",
  description: "Discover personalized local adventures with AI. Your mindful companion for exploring what's around you.",
  keywords: "adventures, local experiences, AI, travel, explore",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-[#f8f2d5] via-[#f8f2d5] to-[#f0e6b8]">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}