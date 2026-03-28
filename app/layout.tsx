import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaunchLoop",
  description:
    "Turn a short event brief into a branded promo kit — poster, reel, voiceover, and music.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0b] text-zinc-100">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
