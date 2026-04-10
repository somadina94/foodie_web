import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Foodie — Fresh food delivery",
    template: "%s · Foodie",
  },
  description:
    "Order from a single curated kitchen, pay securely with Stripe, and track delivery in real time. Foodie — elegant food delivery.",
  keywords: [
    "food delivery",
    "restaurant",
    "order food online",
    "Foodie",
    "Stripe checkout",
    "local food",
  ],
  authors: [{ name: "Foodie" }],
  openGraph: {
    title: "Foodie — Fresh food delivery",
    description: "Order, pay, and track — one kitchen, zero hassle.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foodie — Fresh food delivery",
    description: "Order, pay, and track — one kitchen, zero hassle.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
