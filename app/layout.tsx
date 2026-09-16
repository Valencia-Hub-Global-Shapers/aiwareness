import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-body min-h-screen bg-ink text-paper">
        {children}
      </body>
    </html>
  );
}
