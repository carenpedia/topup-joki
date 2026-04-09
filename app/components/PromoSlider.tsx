"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PromoBanner } from "@prisma/client";

interface PromoSliderProps {
  banners: PromoBanner[];
}

export default function PromoSlider({ banners }: PromoSliderProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="promoBanner">
      {/* Banner images layer */}
      <div className="promoSlidesWrapper">
        {banners.map((item, idx) => (
          <div
            key={item.id}
            className={`promoSlideItem ${idx === i ? "active" : ""}`}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title || "Promo Banner"}
                className="promoSlideImg"
              />
            ) : (
              <div className="promoSlidePlaceholder" />
            )}
            
            {/* Optional clickable overlay if link exists */}
            {item.linkValue && (
               <a 
                 href={item.linkValue} 
                 target={item.linkType === "EXTERNAL" ? "_blank" : "_self"}
                 rel="noopener noreferrer"
                 className="promoSlideLink"
               />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Dots Overlay */}
      <div className="promoDots">
        {banners.map((_, idx) => (
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
  );
}
