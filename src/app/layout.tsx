import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Permanent_Marker, VT323, Zilla_Slab } from "next/font/google";
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

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

// Shared links stay small: just "AK" and the crest.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.akcushman.tech"),
  title: "AK Cushman",
  openGraph: {
    title: "AK",
    siteName: "AK",
    url: "/",
    type: "website",
    images: [{ url: "/ak.png", width: 256, height: 256, alt: "AK" }],
  },
  twitter: { card: "summary", title: "AK", images: ["/ak.png"] },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${vt323.variable} ${slab.variable} ${marker.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
