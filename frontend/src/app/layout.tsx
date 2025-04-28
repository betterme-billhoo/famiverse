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
  title: "家教宇宙 | Famiverse",
  description: "一个专注于德行、智慧（不仅仅是智力）、身体、心灵、美育、实践全面发展的家庭教育开源平台。帮助家长培养幸福的孩子，而不是教育内卷的牺牲品 | An open-source family education platform focused on the comprehensive development of Character, Wisdom, Physical Well-being, Inner Well-being, Aesthetics, and Hands-on Practice. Nurturing happy children, not victims of the educational rat race.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
