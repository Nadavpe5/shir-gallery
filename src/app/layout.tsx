import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  Inter,
  Playfair_Display,
  Montserrat,
  Cormorant_Garamond,
  Oswald,
  Raleway,
  Bodoni_Moda,
  Lora,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Shir Yadgar Photography",
  description: "Premium client gallery",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Shir Yadgar Photography",
    description: "Premium client gallery",
    siteName: "Shir Yadgar Photography",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shir Yadgar Photography",
    description: "Premium client gallery",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shir Gallery",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f5f0",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${cormorant.variable} ${oswald.variable} ${raleway.variable} ${bodoni.variable} ${lora.variable} font-sans`}
      >
        {children}
        <Script id="sw-register" strategy="afterInteractive">
          {`if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js")}`}
        </Script>
      </body>
    </html>
  );
}
