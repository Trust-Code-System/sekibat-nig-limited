import type { Metadata } from "next";
import "./admin.css";
export const metadata: Metadata = { title: "Website content · Sekibat", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="cms">{children}</div>; }
