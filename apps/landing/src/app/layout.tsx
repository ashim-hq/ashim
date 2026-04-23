import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SnapOtter — Self-Hosted Image Processing",
  description:
    "50+ image processing tools with local AI. Runs 100% offline. No data leaves your network. Open source and free forever.",
  metadataBase: new URL("https://snapotter.com"),
  openGraph: {
    title: "SnapOtter — Self-Hosted Image Processing",
    description:
      "50+ image processing tools with local AI. Runs 100% offline. No data leaves your network.",
    url: "https://snapotter.com",
    siteName: "SnapOtter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapOtter — Self-Hosted Image Processing",
    description:
      "50+ image processing tools with local AI. Runs 100% offline. No data leaves your network.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground font-[family-name:var(--font-inter)] antialiased">
        {children}
      </body>
    </html>
  );
}
