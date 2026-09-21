import type { Metadata, Viewport } from "next";
import {
  FORM_CLOSES,
  MONTHLY_TARGET,
  ORGANISATION,
  ORGANISATION_SHORT,
  SUGGESTED_AMOUNT,
  TARGET_MEMBERS,
  formatRupees,
} from "@/lib/constants";
import "./globals.css";

// The canonical address. Link previews need absolute URLs, and the members
// meet this site as a link pasted into the Jamaat's WhatsApp group, so the
// card that unfurls there is the first thing most of them will ever see of it.
const SITE_URL = "https://pjmdtf.vercel.app";

const SUMMARY =
  `If ${TARGET_MEMBERS} earning members give ${formatRupees(SUGGESTED_AMOUNT)} a month, ` +
  `the ${formatRupees(MONTHLY_TARGET)} is covered in full. Form closes ${FORM_CLOSES}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: ORGANISATION_SHORT,
  description: `${ORGANISATION}. ${SUMMARY}`,
  applicationName: ORGANISATION_SHORT,
  // The Jamaat's finances are its own business. Shared by link, not searched
  // for — and the crawlers that unfurl a link preview do not consult this.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: ORGANISATION_SHORT,
    title: "Monthly contribution towards the Jamaat's salaries",
    description: SUMMARY,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monthly contribution towards the Jamaat's salaries",
    description: SUMMARY,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a2e23",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
