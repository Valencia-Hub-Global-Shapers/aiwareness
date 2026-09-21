import type { Metadata } from "next";
import { Newsreader, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-display",
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "AIwareness | Global Shapers",
  description:
    "Aprende a identificar contenido generado por inteligencia artificial.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-body min-h-screen bg-paper text-ink-soft">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
