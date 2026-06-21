import type { Metadata, Viewport } from "next";
import { Tajawal, El_Messiri } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-el-messiri",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  title: "روح الحياة | Spirito Vita - قائمة الطعام",
  description:
    "مطعم روح الحياة - طعام صحي بجودة مميزة. اطلب الآن عبر القائمة الإلكترونية.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "روح الحياة",
  },
  icons: {
    icon: "/logo-en.png",
    apple: "/logo-ar.png",
  },
  openGraph: {
    title: "روح الحياة | Spirito Vita",
    description: "طعام صحي • جودة مميزة",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0D3B37",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/logo-ar.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${tajawal.variable} ${elMessiri.variable} font-arabic antialiased`}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
