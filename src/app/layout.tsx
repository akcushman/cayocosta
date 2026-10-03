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

const DESCRIPTION =
  "hello, i'm autumnkyoko. thanks for tuning in. Founder, technology lover, optimist, pro-humanist and U.S. Navy veteran. This is an analog of my life.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.akcushman.tech"),
  title: "AK Cushman",
  description: DESCRIPTION,
  openGraph: {
    title: "AK Cushman · Now broadcasting",
    description: DESCRIPTION,
    url: "/",
    siteName: "AK Cushman",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AK Cushman · Now broadcasting",
    description: DESCRIPTION,
  },
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
