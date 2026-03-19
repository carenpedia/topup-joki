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
