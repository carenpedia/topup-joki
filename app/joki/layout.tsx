// app/joki/layout.tsx
import "../topup/topup.css";

export default function JokiLayout({ children }: { children: React.ReactNode }) {
  return <div className="topupScope">{children}</div>;
}
