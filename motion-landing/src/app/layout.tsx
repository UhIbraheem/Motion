import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Motion - AI-Powered Local Adventures",
  description: "Your personal AI guide for curated local adventures. Whether you're chill or adventurous, Motion crafts experiences around your vibe.",
  keywords: ["AI", "local adventures", "travel", "recommendations", "lifestyle", "discovery"],
  authors: [{ name: "Motion Team" }],
  openGraph: {
    title: "Motion - Discover Life in Motion",
    description: "Your personal AI guide for curated local adventures",
    url: "https://motionflow.app",
    siteName: "Motion",
    images: [
      {
        url: "/og-image.jpg", // You'll want to add this
        width: 1200,
        height: 630,
        alt: "Motion - AI-Powered Local Adventures",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motion - Discover Life in Motion",
    description: "Your personal AI guide for curated local adventures",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}