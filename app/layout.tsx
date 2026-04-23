import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
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
        className={`${geistSans.variable} ${geistMono.variable} ${bebas.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5f5f5]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
