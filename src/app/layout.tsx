import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/shared/styles.css";
import { APP_TEXT } from "./copy";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_TEXT.title,
  description: APP_TEXT.description,
};

const UI = {
  fonts: `${geistSans.variable} ${geistMono.variable}`,
} as const;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={UI.fonts}>
      <body>{children}</body>
    </html>
  );
}
