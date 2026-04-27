"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export type FlashSaleItem = {
  id: string;
  gameName: string;
  gameKey: string;
  productName: string;
  imageUrl: string | null;
  basePrice: number;
  flashPrice: number;
  endAt: string;
  maxStock: number | null;
  soldCount: number;
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n).replace("Rp", "Rp ");
}

function calculateTimeLeft(targetDate: string) {
  const difference = new Date(targetDate).getTime() - new Date().getTime();
  
  if (difference <= 0) return null;

  const hours = Math.floor((difference / (1000 * 60 * 60)));
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0")
  };
}

function CountdownTimer({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [endAt]);

  if (!timeLeft) {
    return <div className="fsTimerWrap"><span className="fsExpired">Berakhir</span></div>;
  }

  return (
    <div className="fsTimerWrap">
      <div className="fsTimerBox">{timeLeft.hours}</div><span className="fsColon">:</span>
      <div className="fsTimerBox">{timeLeft.minutes}</div><span className="fsColon">:</span>
      <div className="fsTimerBox">{timeLeft.seconds}</div>
    </div>
  );
}

export default function HomeFlashSale({ items }: { items: FlashSaleItem[] }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function checkOverflow() {
      if (!wrapperRef.current) return;
      const containerWidth = wrapperRef.current.clientWidth;
      // Estimasi lebar: 190px per card + 16px gap
      const estimatedItemsWidth = items.length * 190 + Math.max(0, items.length - 1) * 16;
      setShouldAnimate(estimatedItemsWidth > containerWidth);
    }
    
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div className="homeSection">
      <div className="flashStripInteractive">
        <div className="fsStripHeader">
          <div className="fsStripLeft">
            <div className="fsStripIcon">⚡</div>
            <div>
              <div className="fsStripTitle">FLASH SALE BERLANGSUNG!</div>
              <div className="fsStripSub">Diskon terbatas, buruan ambil sebelum habis!</div>
            </div>
          </div>
        </div>

        <div className="fsGridWrapper" ref={wrapperRef}>
          <div className={`fsGrid ${shouldAnimate ? "fsAnimate" : ""}`}>
            {(shouldAnimate ? [...items, ...items] : items).map((item, idx) => {
              const saveAmount = item.basePrice > item.flashPrice ? item.basePrice - item.flashPrice : 0;
              const isExhausted = item.maxStock !== null && item.soldCount >= item.maxStock;
              const Wrapper = isExhausted ? 'div' : Link;
              const wrapperProps = isExhausted ? { className: "fsCard" } : { href: `/topup/${item.gameKey}`, className: "fsCard" };

              return (
                <Wrapper key={`${item.id}-${idx}`} {...(wrapperProps as any)} style={isExhausted ? { opacity: 0.5, filter: 'grayscale(100%)', position: 'relative', cursor: 'not-allowed' } : undefined}>
                  <div className="fsCardImageWrapper">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="fsCardImage" />
                    ) : (
                      <div className="fsCardFallback">{item.gameName.substring(0, 2).toUpperCase()}</div>
                    )}
                    {saveAmount > 0 && !isExhausted && (
                      <div className="fsSaveBadge">
                        Hemat {formatRupiah(saveAmount)}
                      </div>
                    )}
                    <div className="fsTimerOverlay">
                      <CountdownTimer endAt={item.endAt} />
                    </div>
                  </div>
                  <div className="fsCardContent">
                    <div className="fsGameName">{item.gameName}</div>
                    <div className="fsProductName">{item.productName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                      <div className="fsPriceWrapper" style={{ marginTop: 0 }}>
                        <div className="fsPriceOriginal">{formatRupiah(item.basePrice)}</div>
                        <div className="fsPriceNow">{formatRupiah(item.flashPrice)}</div>
                      </div>
                      {item.maxStock !== null && (
                        <div style={{ fontSize: '10px', color: '#f87171', fontWeight: 800, marginBottom: '2px' }}>
                          Sisa: {Math.max(0, item.maxStock - item.soldCount)}
                        </div>
                      )}
                    </div>
                  </div>
                  {isExhausted && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', zIndex: 10 }}>
                      <span style={{ padding: '6px 14px', border: '2px solid #fff', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 900, borderRadius: '6px', fontSize: '16px', letterSpacing: '2px', transform: 'rotate(-5deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>HABIS</span>
                    </div>
                  )}
                </Wrapper>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
