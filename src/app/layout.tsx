import type { Metadata, Viewport } from "next";
import { Geist, Permanent_Marker, VT323, Zilla_Slab } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
});

const slab = Zilla_Slab({
  variable: "--font-slab",
  weight: "700",
  subsets: ["latin"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cayo Costa",
  description: "Now broadcasting.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${vt323.variable} ${slab.variable} ${marker.variable}`}>
      <body>{children}</body>
    </html>
  );
}
