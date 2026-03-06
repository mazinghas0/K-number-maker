import type { Metadata, Viewport } from "next";
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
  title: "K-number Fortune | Your Mystic Destiny Oracle",
  description: "Experience the fusion of Eastern Five Elements philosophy and global destiny tools. Generate your lucky numbers with the guidance of the Mystic Oracle.",
  keywords: ["Lotto", "Fortune", "Oracle", "Lucky Numbers", "Five Elements", "Saju", "K-Fortune"],
  authors: [{ name: "K-number Team" }],
  openGraph: {
    title: "K-number Fortune | Your Mystic Destiny Oracle",
    description: "Invoke your luck with Eastern mystical guidance. Global lottery presets and personalized fortune reports.",
    url: "https://k-number-maker.pages.dev",
    siteName: "K-number Fortune",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">
          <div className="w-full max-w-[480px] bg-white dark:bg-black min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
