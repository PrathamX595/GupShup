import type { Metadata } from "next";
import localFont from 'next/font/local';
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

const loveYaLikeASister = localFont({
  src: '../../public/fonts/LoveYaLikeASister.ttf',
  variable: '--font-love-ya',
  weight: '400',
});

const kiwiMaruRegular = localFont({
  src: '../../public/fonts/KiwiMaru-regular.ttf',
  variable: '--font-kiwi-regular',
  weight: '400',
});

const kiwiMaruMedium = localFont({
  src: '../../public/fonts/KiwiMaru-Medium.ttf',
  variable: '--font-kiwi-medium',
  weight: '500',
});

export const metadata: Metadata = {
  title: "GupShup",
  description: "Talk to the world, one stranger at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kiwiMaruMedium.variable} ${kiwiMaruRegular.variable} ${loveYaLikeASister.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
