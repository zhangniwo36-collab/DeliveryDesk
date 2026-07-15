import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeliveryDesk 鈥?Client Delivery & Approval Portal",
  description: "A zero-setup project delivery workspace for milestones, tasks, approvals, risks, budgets, and client visibility.",
  openGraph: { title: "DeliveryDesk 鈥?Project delivery, without the status chase", description: "Milestones, tasks, approvals, risks, and budget health in one client-ready workspace.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "DeliveryDesk 鈥?Client Delivery Portal", description: "A complete interactive project delivery case study.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" translate="no"><body className={`${sans.variable} ${mono.variable}`}>{children}</body></html>;
}

