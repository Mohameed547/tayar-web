import type { Metadata } from "next";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import "./globals.css";
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
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Navbar />
                <main className="pt-5">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
