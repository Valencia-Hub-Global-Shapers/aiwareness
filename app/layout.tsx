import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

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
    <html lang="es">
      <body className="font-body flex min-h-screen flex-col bg-ink text-paper">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
