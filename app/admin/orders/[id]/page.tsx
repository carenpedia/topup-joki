"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/components/ToastProvider";
import { useAsyncAction } from "@/app/components/useAsyncAction";

const { loading: updating, run } = useAsyncAction();
const toast = useToast();
const params = useParams();
const id = params?.id as string

const [data, setData] = useState<any>(null);
const [loadingPage, setLoadingPage] = useState(true);

async function load() {
  try {
    setLoadingPage(true);
    const res = await fetch(`/api/admin/orders/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Failed load");
    setData(json);
  } catch (e: any) {
    toast.critical(e.message);
  } finally {
    setLoadingPage(false);
  }
}
useEffect(() => {
  if (id) load();
}, [id]);

async function updateStatus(next: "PAID" | "FAILED") {
  await run(async () => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.critical(j?.error || `Gagal update status (${res.status})`);
      return;
    }

    toast.success(`Status berhasil diubah ke ${next}`);
    await load();
  });
}


type OrderDetail = {
  id: string;
  orderNo: string;
  serviceType: string;
  status: string;
  createdAt: string | null;
  paidAt: string | null;

  user: string;
  total: number;
  basePrice: number;

  paymentMethod: string;
  gatewayMethodKey: string;

  contactWhatsapp: string;
  contactEmail: string;

  game: string;
  item: string;
  target: string;

  joki: null | {
    loginVia: string;
    userIdNickname: string;
    loginId: string;
    password: string;
    noteForJoki: string;
    status: string;
    heroRequests: string[];
  };
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(n);
}

/* ===============================
   ENUM LABEL FORMATTER
=================================*/

function formatLoginVia(v: string) {
  const map: Record<string, string> = {
    MOONTON: "Moonton",
    GOOGLE: "Google",
    FACEBOOK: "Facebook",
    VK: "VK",
    TIKTOK: "Tiktok",
    TELEGRAM: "Telegram",
  };
  return map[v] || v;
}

function formatJokiStatus(v: string) {
  const map: Record<string, string> = {
    PENDING: "Menunggu",
    IN_PROGRESS: "Sedang Dikerjakan",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };
  return map[v] || v;
}

/* ===============================
   BADGE STYLE
=================================*/

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${className}`}>
      {children}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PAID":
      return <span className="admin-badge admin-badge-success">PAID</span>;
    case "FAILED":
      return <span className="admin-badge admin-badge-error">FAILED</span>;
    case "PENDING_PAYMENT":
      return <span className="admin-badge admin-badge-warning">PENDING</span>;
    default:
      return <span className="admin-badge admin-badge-info">{status}</span>;
  }
}

function JokiStatusBadge({ status }: { status: string }) {
  const label = formatJokiStatus(status);
  switch (status) {
    case "PENDING":
      return <span className="admin-badge admin-badge-warning">{label}</span>;
    case "IN_PROGRESS":
      return <span className="admin-badge admin-badge-info">{label}</span>;
    case "COMPLETED":
      return <span className="admin-badge admin-badge-success">{label}</span>;
    case "CANCELLED":
      return <span className="admin-badge admin-badge-error">{label}</span>;
    default:
      return <span className="admin-badge admin-badge-info">{status}</span>;
  }
}

/* ===============================
   COPY BUTTON (Formal)
=================================*/

function CopyBtn({ value, label }: { value: string; label: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(true);
      toast.success(`${label} berhasil disalin`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.critical("Gagal menyalin text");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="admin-btn admin-btn-ghost admin-btn-sm"
      style={{ padding: "4px 10px", height: "auto" }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function InfoItem({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="admin-info-item">
      <span className="admin-info-label">{label}</span>
      <div className="admin-info-value">{value || children}</div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [data, setData] = useState<OrderDetail | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => setData(d.row));
  }, [params.id]);

  if (!data) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="admin-dashboard-wrapper">
      <header className="admin-page-header">
        <div className="admin-page-title-wrap">
          <h1 className="admin-page-title">Order Detail</h1>
          <p className="admin-page-subtitle">Transaction detail for Order ID: {data.orderNo}</p>
        </div>
        <Link href="/admin/orders" className="admin-btn admin-btn-ghost">
          ← Back to Orders
        </Link>
      </header>

      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">General Information</h4>
          <OrderStatusBadge status={data.status} />
        </div>
        <div className="admin-card-body">
          <div className="admin-detail-grid">
            <InfoItem label="Order No" value={data.orderNo} />
            <InfoItem label="Service Type" value={data.serviceType} />
            <InfoItem label="Customer" value={data.user} />
            <InfoItem label="Total Amount" value={formatCurrency(data.total)} />
            <InfoItem label="Payment Method" value={data.paymentMethod} />
            <InfoItem label="Created At" value={data.createdAt} />
            <InfoItem label="Paid At" value={data.paidAt || "-"} />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">Order Content</h4>
        </div>
        <div className="admin-card-body">
          <div className="admin-detail-grid">
            <InfoItem label="Game" value={data.game} />
            <InfoItem label="Item / Nominal" value={data.item} />
            <InfoItem label="Target ID" value={data.target} />
          </div>
        </div>
      </div>

      {data.joki && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="admin-card-title">Joki Details</h4>
            <JokiStatusBadge status={data.joki.status} />
          </div>
          <div className="admin-card-body">
            <div className="admin-detail-grid" style={{ marginBottom: 24 }}>
              <InfoItem label="Login Via" value={formatLoginVia(data.joki.loginVia)} />
              <InfoItem label="User ID / Nickname" value={data.joki.userIdNickname} />
              
              <InfoItem label="Login ID">
                <div className="flex items-center gap-2">
                  <span>{data.joki.loginId}</span>
                  <CopyBtn value={data.joki.loginId} label="Login ID" />
                </div>
              </InfoItem>

              <InfoItem label="Password">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-mono">{data.joki.password}</span>
                  <CopyBtn value={data.joki.password} label="Password" />
                </div>
              </InfoItem>

              <InfoItem label="Note for Joki" value={data.joki.noteForJoki || "-"} />
            </div>

            <div className="admin-info-item">
              <span className="admin-info-label">Hero Request</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.joki.heroRequests.map((h, i) => (
                  <span key={i} className="admin-badge admin-badge-info">
                    {h}
                  </span>
                ))}
                {data.joki.heroRequests.length === 0 && <span className="text-sm text-dim">-</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
