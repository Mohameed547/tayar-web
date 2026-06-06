import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Navbar />
                <main className="pt-5">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
