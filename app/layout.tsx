import type { Metadata } from "next";
import { Inter, Krona_One } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const kronaOne = Krona_One({ weight: "400", subsets: ["latin"], variable: "--font-krona-one" });

export const metadata: Metadata = {
  title: "DASH - Downloader multi-platform",
  description: "Web tools untuk menyiapkan link video dari YouTube, TikTok, Facebook, dan Instagram dalam satu tempat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>
      <body className={`${inter.variable} ${kronaOne.variable} ${inter.className}`}>{children}</body>
    </html>
  );
}
