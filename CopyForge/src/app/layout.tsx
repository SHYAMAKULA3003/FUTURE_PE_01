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
  title: "AI Website Copy Generator — Production-Ready Copy for Local Businesses",
  description:
    "Generate complete, SEO-optimized website copy for salons, cafes, clinics, and more. Three tone variants. JSON-LD included. Free and open source.",
  keywords: [
    "AI copy generator",
    "website copy",
    "local business",
    "SEO",
    "salon website",
    "cafe website",
  ],
  authors: [{ name: "CopyForge Team" }],
  openGraph: {
    title: "AI Website Copy Generator",
    description:
      "Generate complete, SEO-optimized website copy for salons, cafes, clinics, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}