// FILE: src/app/layout.tsx — Root layout
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/styles/globals.css";
const montserrat = Montserrat({ subsets: ["latin", "vietnamese"], variable: "--font-montserrat" });
export const metadata: Metadata = { title: "VESTA Student Portal", description: "Luyện thi IELTS - VESTA Academy" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="vi" className={montserrat.variable}><body className="font-body">{children}</body></html>);
}