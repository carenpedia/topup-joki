"use client";

import React from "react";
import { useConfig } from "./ConfigProvider";
import { usePathname } from "next/navigation";

export default function MaintenanceOverlay({ children }: { children: React.ReactNode }) {
  const config = useConfig();
  const pathname = usePathname();

  const isMaintenance = config.MAINTENANCE_MODE === "ON";
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAuth = pathname.startsWith("/masuk") || pathname.startsWith("/daftar");
  
  // Admin dan halaman auth tertentu tetap bisa diakses agar tidak terkunci total
  if (!isMaintenance || isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="maintenance-wrapper">
        <div className="maintenance-bg">
          <div className="m-glow m-glow-1" />
          <div className="m-glow m-glow-2" />
          <div className="m-grid" />
        </div>

        <div className="maintenance-content">
          <div className="maintenance-card">
            <div className="m-icon-wrap">
              <div className="m-icon-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <div className="m-pulse" />
            </div>

            <h1 className="m-title">Sistem Sedang Dalam Perbaikan</h1>
            <p className="m-desc">
              Kami sedang melakukan pembaruan rutin untuk meningkatkan kualitas layanan dan keamanan transaksi Anda. Mohon maaf atas ketidaknyamanan ini.
            </p>

            <div className="m-divider" />

            <div className="m-footer">
              <p className="m-footer-text">Butuh bantuan mendesak? Hubungi kami via WhatsApp:</p>
              <a 
                href={`https://wa.me/${config.SUPPORT_WHATSAPP}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="m-wa-btn"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Hubungi Customer Service
              </a>
            </div>
          </div>
          
          <div className="m-brand">
            {config.SITE_LOGO ? (
              <img src={config.SITE_LOGO} alt="Logo" className="m-brand-img" />
            ) : (
              <span className="m-brand-text">{config.SITE_NAME}</span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .maintenance-wrapper {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #060d26;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          color: white;
          overflow: hidden;
        }

        .maintenance-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .m-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
        }

        .m-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }

        .m-glow-1 {
          top: -200px;
          right: -200px;
          background: #3b82f6;
          animation: float 20s infinite alternate;
        }

        .m-glow-2 {
          bottom: -200px;
          left: -200px;
          background: #8b5cf6;
          animation: float 25s infinite alternate-reverse;
        }

        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }

        .maintenance-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 500px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .maintenance-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 32px;
          text-align: center;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .m-icon-wrap {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          position: relative;
        }

        .m-icon-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 24px;
          display: grid;
          place-items: center;
          color: white;
          box-shadow: 0 20px 40px rgba(37,99,235,0.4);
        }

        .m-icon-inner svg {
          width: 36px;
          height: 36px;
          animation: spin 4s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .m-pulse {
          position: absolute;
          inset: -10px;
          background: rgba(37,99,235,0.2);
          border-radius: 30px;
          z-index: 1;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          70% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }

        .m-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(to bottom, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .m-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .m-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          margin-bottom: 24px;
        }

        .m-footer-text {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 16px;
        }

        .m-wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #25d366;
          color: white;
          padding: 14px 24px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
          text-decoration: none;
        }

        .m-wa-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(37,211,102,0.3);
        }

        .m-brand {
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .m-brand:hover {
          opacity: 1;
        }

        .m-brand-img {
          height: 32px;
          object-fit: contain;
        }

        .m-brand-text {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: 1px;
        }

        @media (max-width: 480px) {
          .maintenance-card {
            padding: 30px 20px;
            border-radius: 24px;
          }
          .m-title {
            font-size: 20px;
          }
          .m-desc {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
