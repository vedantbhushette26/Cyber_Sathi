import type { Metadata } from "next";
import { Inter, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import UserNav from "@/components/UserNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CYBER SECURE | Phishing Awareness Portal",
  description: "A high-end editorial phishing awareness training and certification platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        {/* Masthead Band */}
        <header className="border-b border-hairline bg-canvas sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Center Logo */}
            <div className="text-center absolute left-1/2 transform -translate-x-1/2 pointer-events-none md:pointer-events-auto">
              <Link href="/">
                <span className="font-display text-2xl md:text-3xl font-extrabold tracking-tighter uppercase text-ink select-none">
                  CYBER·SECURE
                </span>
              </Link>
            </div>

            {/* Nav + Auth Controls */}
            <UserNav />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="bg-ink text-canvas-soft border-t border-hairline py-12 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-display text-xl font-bold tracking-tighter uppercase text-on-primary">
                CYBER·SECURE
              </span>
              <p className="text-xs text-body font-sans max-w-sm">
                Designed under strict editorial standards to empower professionals in identifying digital threats.
              </p>
            </div>
            <div className="text-xs text-body font-sans">
              © {new Date().getFullYear()} Cyber Secure Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
