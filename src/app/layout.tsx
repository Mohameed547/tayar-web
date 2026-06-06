import type { Metadata } from "next";
import { LanguageProvider } from "@/context/language-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeliveryHub",
  description: "Smart shipping platform in Egypt",
}

export default function RootLayout({
    children,
}: {
  children: React.ReactNode
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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}




// 'use client';

// import { Provider } from 'react-redux';
// import { store } from '@/store/store';
// import { Cairo } from "next/font/google";
// import "./globals.css";

// import { Plus_Jakarta_Sans } from 'next/font/google'
// const font = Plus_Jakarta_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700', '800'],
// })

// const cairo = Cairo({
//   subsets: ["arabic", "latin"],
//   variable: "--font-cairo",
// });

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (<html
//     lang="ar"
//     dir="rtl"
//     suppressHydrationWarning
//   >
//     <body className="font-cairo">
//       <Provider store={store}>
//         {children}
//       </Provider>
//     </body>
//   </html>
//   );
// }