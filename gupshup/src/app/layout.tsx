import type { Metadata } from "next";
import { Kiwi_Maru, Love_Ya_Like_A_Sister } from "next/font/google";
import "./globals.css";

const kiwiMaru = Kiwi_Maru({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-kiwi-regular",
});

const loveYa = Love_Ya_Like_A_Sister({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-love-ya",
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
      <body className={`${kiwiMaru.variable} ${loveYa.variable}`} style={{"--font-kiwi-medium": "var(--font-kiwi-regular)"} as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}