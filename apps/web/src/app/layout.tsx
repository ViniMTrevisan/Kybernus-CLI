import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"; // Strong, Industrial Fonts
import "./globals.css";
import { cn } from "@/lib/utils";
import { CookieConsent } from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Kybernus - The Ultimate Backend Scaffolding CLI",
  description: "Build production-ready Node.js, NestJS, Spring Boot, FastAPI, and Next.js applications in seconds. The only template CLI you'll ever need.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        inter.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable,
        "font-sans bg-background text-foreground antialiased selection:bg-tech-blue/30 selection:text-white"
      )}>


        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
