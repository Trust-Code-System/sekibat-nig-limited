import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./admin.css";
const studioSans = Manrope({
  variable: "--font-studio",
  subsets: ["latin"],
  display: "swap",
});
const studioMono = Geist_Mono({
  variable: "--font-studio-mono",
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = {
  title: "Website content · Sekibat",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`cms ${studioSans.variable} ${studioMono.variable}`}>
      {children}
    </div>
  );
}
