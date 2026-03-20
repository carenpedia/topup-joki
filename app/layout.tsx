// Force all pages to be dynamically rendered (no static prerender)
// This prevents build failures when DB is not available during build
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import "./globals.css";
import { ToastProvider } from "./components/ToastProvider";
import { UiProgressProvider } from "@/app/components/UiProgress";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>
  <UiProgressProvider>{children}</UiProgressProvider>
</ToastProvider>
        </body>
    </html>
  );
}
