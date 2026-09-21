import type { Metadata, Viewport } from "next";
import { ORGANISATION, ORGANISATION_SHORT, JAMAAT } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: `${ORGANISATION_SHORT} — ${JAMAAT}`,
  description: `${ORGANISATION}, ${JAMAAT}. Member directory and voluntary monthly contribution form.`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
