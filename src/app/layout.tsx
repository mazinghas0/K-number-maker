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
  title: "K-number maker",
  description: "나만의 맞춤 번호 생성기 + 루틴 관리 AI 도구",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "K-number",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
        <div className="flex justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
          {/* 모바일 뷰 제한 박스 (최대 480px, 그림자 효과) */}
          <div className="w-full max-w-[480px] bg-white dark:bg-black min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
