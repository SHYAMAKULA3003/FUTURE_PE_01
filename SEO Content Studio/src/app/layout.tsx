import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEO Content Studio - AI-Powered Blog & Content Cluster Generator",
  description: "Generate SEO-optimized pillar blogs, supporting articles, and complete content clusters for business websites. AI-powered keyword strategy and content generation.",
  keywords: ["SEO", "Content Marketing", "Blog Generator", "Content Clusters", "AI Content", "Local SEO", "Keyword Strategy"],
  authors: [{ name: "SEO Content Studio" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SEO Content Studio",
    description: "AI-Powered SEO Blog & Content Cluster Generator for Business Websites",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Content Studio",
    description: "AI-Powered SEO Blog & Content Cluster Generator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
