import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CityProvider } from "@/lib/context/city";
import { CompareProvider } from "@/lib/context/compare";
import { AdvisorProvider } from "@/lib/context/advisor";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CompareBar } from "@/components/compare/CompareBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoSage — India's Smartest Car Advisor",
  description:
    "Tell AutoSage what you need. Get 3 cars that are actually right for you — with real ownership costs, honest tradeoffs, and one-tap comparison.",
  keywords: ["car advisor", "India", "CarDekho", "AI", "buy car"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <ToastProvider>
          <CityProvider>
            <CompareProvider>
              <AdvisorProvider>
                {children}
                <CompareBar />
              </AdvisorProvider>
            </CompareProvider>
          </CityProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
