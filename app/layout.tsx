// Force all pages to be dynamically rendered (no static prerender)
// This prevents build failures when DB is not available during build
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import "./globals.css";
import { ToastProvider } from "./components/ToastProvider";
import { UiProgressProvider } from "@/app/components/UiProgress";
import { ConfigProvider } from "./components/ConfigProvider";
import MaintenanceOverlay from "./components/MaintenanceOverlay";
import Gascript from "./components/Gascript";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  let config: Record<string, string> = {};
  
  try {
    const settings = await prisma.globalSetting.findMany({
      where: { key: { in: ["SITE_NAME", "SITE_SLOGAN", "SITE_LOGO"] } }
    });
    
    config = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  } catch (e) {
    console.error("[LAYOUT] Failed to load settings from DB:", (e as Error).message);
    // Fallback ke default values agar website tetap bisa diakses
  }

  const name = config.SITE_NAME || "CarenPedia";
  const slogan = config.SITE_SLOGAN || "Platform Top Up Terpercaya";
  const logo = config.SITE_LOGO || "/favicon.ico";

  return {
    title: {
      default: `${name} - ${slogan}`,
      template: `%s | ${name}`,
    },
    description: slogan,
    icons: {
      icon: logo,
      apple: logo,
    },
  };
}

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
          <Gascript />
          <ToastProvider>
            <UiProgressProvider>
              <MaintenanceOverlay>
                {children}
              </MaintenanceOverlay>
            </UiProgressProvider>
          </ToastProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
