import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Admin() {
  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />
      <div className="shell">
        <div className="section">
          <div className="title">Admin</div>
          <div className="subtitle">Manage banner, game/nominal, member/reseller, flash sale, order, voucher.</div>

          <div className="spacer" />
          <div className="row">
            <Link className="btn btnPrimary" href="/admin/banners">Banner Slider</Link>
            <Link className="btn btnGhost" href="/admin/games">Game & Nominal</Link>
            <Link className="btn btnGhost" href="/admin/orders">Orders</Link>
            <Link className="btn btnGhost" href="/admin/vouchers">Vouchers</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
