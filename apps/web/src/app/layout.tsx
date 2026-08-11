import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kismet — Life Script Decoder",
  description: "Interactive Kismet birth chart calculator and life script decoder",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Global Nav Bar — shows on all pages */}
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="font-semibold tracking-tight hover:text-primary transition-colors"
            >
              ✦ Kismet
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/form"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Form
              </Link>
            </div>
          </div>
        </nav>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
