import type { Metadata } from "next"
import { Cairo, Plus_Jakarta_Sans } from "next/font/google"
import Providers from "./Providers"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${cairo.variable} ${plusJakarta.variable}`}>
        <Providers>
          {children}
        </Providers>
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