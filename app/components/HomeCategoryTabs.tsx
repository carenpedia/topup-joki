"use client";

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

  function handleClick(catId: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (catId) {
      params.set("cat", catId);
    } else {
      params.delete("cat");
    }

    // Preserve search query if present
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="homeTabsStrip">
      <button
        type="button"
        className={`homeTab ${activeId === null ? "active" : ""}`}
        onClick={() => handleClick(null)}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`homeTab ${activeId === cat.id ? "active" : ""}`}
          onClick={() => handleClick(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
