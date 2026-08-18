import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "MY STYLE | Luxury Streetwear & Official Clothing Store",
  description: "Explore the official MY STYLE luxury streetwear collection. Shop Nike ACG, Vintage Jackets, Silk Shirts, and Premium Denim with instant express delivery.",
  keywords: ["streetwear", "clothing store", "online order", "my style", "nike acg", "denim", "jackets"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} antialiased`}>
      <body className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
