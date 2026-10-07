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
  title: "Business Review Helper",
  description: "Rate your experience and choose a review to share.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        <link rel="preload" href="/emoji-default.png" as="image" />
        <link rel="preload" href="/emoji-1.png" as="image" />
        <link rel="preload" href="/emoji-2.png" as="image" />
        <link rel="preload" href="/emoji-3.png" as="image" />
        <link rel="preload" href="/emoji-4.png" as="image" />
        <link rel="preload" href="/emoji-5.png" as="image" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F8F9FC] text-gray-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
