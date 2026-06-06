import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "DeliveryHub",
    description: "Smart shipping platform in Egypt",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={cairo.className}>{children}</body>
    </html>
  );
}
