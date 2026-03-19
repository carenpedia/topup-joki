// app/topup/layout.tsx
import "./topup.css";

export default function TopupLayout({ children }: { children: React.ReactNode }) {
  return <div className="topupScope">{children}</div>;
}
