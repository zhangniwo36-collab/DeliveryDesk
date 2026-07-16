import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeliveryDesk — Client Delivery & Approval Portal",
  description: "A zero-setup project delivery workspace for milestones, tasks, approvals, risks, budgets, and client visibility.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "DeliveryDesk — Project delivery, without the status chase", description: "Milestones, tasks, approvals, risks, and budget health in one client-ready workspace.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "DeliveryDesk — Client Delivery Portal", description: "A complete interactive project delivery case study.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" translate="no"><body>{children}</body></html>;
}

