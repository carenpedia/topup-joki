// Force all pages to be dynamically rendered (no static prerender)
// This prevents build failures when DB is not available during build
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import "./globals.css";
import { ToastProvider } from "./components/ToastProvider";
import { UiProgressProvider } from "@/app/components/UiProgress";
import { ConfigProvider } from "./components/ConfigProvider";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={inter.className}>
        <ConfigProvider>
          <ToastProvider>
            <UiProgressProvider>{children}</UiProgressProvider>
          </ToastProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
