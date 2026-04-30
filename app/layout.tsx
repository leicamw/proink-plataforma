import type { Metadata } from "next";
import { Barlow_Condensed, Space_Grotesk, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// Display / headings — substitui Bebas Neue
const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-bebas", // mantém variável para não quebrar nenhuma classe
  display: "swap",
});

// Body / UI — substitui Geist Sans
const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pro Ink — Plataforma para Tatuadores",
  description: "Cursos, IA para decalques e ferramentas para tatuadores profissionais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="pt-BR"
        className={`${barlowCondensed.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5f5f5]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
