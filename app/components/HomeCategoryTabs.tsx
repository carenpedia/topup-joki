"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

type CategoryTab = {
  id: string;
  name: string;
};

export default function HomeCategoryTabs({
  categories,
  activeId,
}: {
  categories: CategoryTab[];
  activeId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  function handleClick(catId: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (catId) {
      params.set("cat", catId);
    } else {
      params.delete("cat");
    }

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/", { scroll: false });
    });
  }

  return (
    <div className={`homeTabsStrip ${isPending ? "pending" : ""}`} style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 0.2s" }}>
      <button
        type="button"
        disabled={isPending}
        className={`homeTab ${activeId === null ? "active" : ""}`}
        onClick={() => handleClick(null)}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          disabled={isPending}
          className={`homeTab ${activeId === cat.id ? "active" : ""}`}
          onClick={() => handleClick(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
