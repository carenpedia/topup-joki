import Link from "next/link";

export default function Admin() {
  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">A</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Admin Dashboard</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="subtitle">Manage banner, game/nominal, member/reseller, flash sale, order, voucher.</div>

          <div className="spacer" />
          <div className="contact-row">
            <Link className="btn-ghost btn-xs" href="/admin/banners">Banner Slider</Link>
            <Link className="btn-ghost btn-xs" href="/admin/games">Game & Nominal</Link>
            <Link className="btn-ghost btn-xs" href="/admin/orders">Orders</Link>
            <Link className="btn-ghost btn-xs" href="/admin/vouchers">Vouchers</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
