import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import LiveTicker from "@/components/LiveTicker";   // ← social-proof

/* ----- шрифт ----- */
const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

/* ----- SEO ----- */
export const metadata: Metadata = {
  title: "DS EKB AI HVAC",
  description: "Автоматизация HVAC-заявок с ИИ-диагностикой",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {children}

        {/* Live-статистика (Social Proof) */}
        <LiveTicker />
      </body>
    </html>
  );
}
