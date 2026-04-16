"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Config = Record<string, string>;

const ConfigContext = createContext<Config>({
  SITE_NAME: "CarenPedia",
  SITE_SLOGAN: "Platform top up game termurah & tercepat.",
  SUPPORT_WHATSAPP: "62812345678",
  SITE_LOGO: "",
});

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings", { next: { revalidate: 60 } } as any);
        const data = await res.json();
        if (data && !data.error) {
          setConfig(data);
        }
      } catch (err) {
        console.error("Config load error:", err);
      }
    }
    load();
  }, []);

  return (
    <ConfigContext.Provider value={{
      SITE_NAME: config.SITE_NAME || "CarenPedia",
      SITE_SLOGAN: config.SITE_SLOGAN || "Platform top up game termurah & tercepat.",
      SUPPORT_WHATSAPP: config.SUPPORT_WHATSAPP || "62812345678",
      ...config
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
