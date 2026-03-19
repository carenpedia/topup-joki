"use client";

import { useCallback, useState } from "react";
import { useUiProgress } from "./UiProgress";

export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const ui = useUiProgress();

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      if (loading) return;
      setLoading(true);
      ui.start();
      try {
        await fn();
      } finally {
        ui.done();
        setLoading(false);
      }
    },
    [loading, ui]
  );

  return { loading, run };
}
