import type { Metadata } from "next";
import DashboardView from "@/components/dashboard/DashboardView";
import { loadDashboardData } from "@/lib/dashboard";

// Datos agregados: se regeneran como mucho cada 5 minutos.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Dashboard | AIwareness",
  description: "Resultados agregados de AIwareness por hub y pais.",
  robots: { index: false },
};

export default async function DashboardPage() {
  const data = await loadDashboardData();
  return <DashboardView {...data} />;
}
