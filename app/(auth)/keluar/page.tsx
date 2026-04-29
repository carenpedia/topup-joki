"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeluarPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // ignore errors, cookie might already be cleared
      }
      // Redirect ke halaman login setelah logout
      window.location.href = "/masuk";
    })();
  }, [router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      color: "rgba(255,255,255,0.5)",
      fontSize: 14,
      fontWeight: 600,
    }}>
      Mengeluarkan sesi...
    </div>
  );
}
