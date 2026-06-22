import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Display/UI voice — a technical grotesk, used with restraint.
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Every monetary figure is set in this tabular monospace.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Change Bureau · Currency Converter",
  description:
    "Live foreign-exchange conversion across 10 currencies, updated hourly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
