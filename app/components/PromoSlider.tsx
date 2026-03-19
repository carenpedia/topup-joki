"use client";

import { useEffect, useState } from "react";
import { promoSlides } from "./data";

export default function PromoSlider() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!promoSlides.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % promoSlides.length), 4500);
    return () => clearInterval(t);
  }, []);

  if (!promoSlides.length) return null;

  const s = promoSlides[i];

  return (
    <div className="promoBanner">
      <div className="promoTop">
        <div className="promoMeta">
          <span className="promoPill">{s.pill}</span>
          <span className="promoTitle">{s.title}</span>
        </div>

        <div className="promoDots">
          {promoSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`slide ${idx + 1}`}
              className={`promoDot ${idx === i ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="promoDesc">{s.desc}</div>
    </div>
  );
}
