"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
      return <Badge className="bg-green-500/20 text-green-400">PAID</Badge>;
    case "FAILED":
      return <Badge className="bg-red-500/20 text-red-400">FAILED</Badge>;
    case "PENDING_PAYMENT":
      return <Badge className="bg-yellow-500/20 text-yellow-400">PENDING</Badge>;
    default:
      return <Badge className="bg-gray-500/20 text-gray-300">{status}</Badge>;
  }
}

function JokiStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400">{formatJokiStatus(status)}</Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-blue-500/20 text-blue-400">{formatJokiStatus(status)}</Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-green-500/20 text-green-400">{formatJokiStatus(status)}</Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-500/20 text-red-400">{formatJokiStatus(status)}</Badge>
      );
    default:
      return <Badge className="bg-gray-500/20 text-gray-300">{status}</Badge>;
  }
}

/* ===============================
   COPY BUTTON (glow + press)
=================================*/

function CopyBtn({ value, label }: { value: string; label: string }) {
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value || "");
      toast.success("Login ID berhasil disalin");
    } catch {
      // fallback for older browser / blocked clipboard
      try {
        const el = document.createElement("textarea");
        el.value = value || "";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        toast.success("Login ID berhasil disalin");
      } catch {
        alert("Gagal copy (clipboard diblokir browser).");
      }
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
      border border-white/10 bg-white/5 hover:bg-white/7 active:scale-[0.98]
      transition-all`}
      style={{
        boxShadow: toast ? "0 0 0 3px rgba(59,130,246,.18)" : undefined,
      }}
      title={`Copy ${label}`}
    >
      {toast ? "✅ Copied" : "Copy"}
    </button>
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
    <div className="p-6 text-white space-y-6">
      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <h1 className="text-xl font-bold mb-4">Order #{data.orderNo}</h1>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Status:</div>
          <div>
            <OrderStatusBadge status={data.status} />
          </div>

          <div>Service Type:</div>
          <div>{data.serviceType}</div>

          <div>User:</div>
          <div>{data.user}</div>

          <div>Total:</div>
          <div>{formatCurrency(data.total)}</div>

          <div>Payment:</div>
          <div>{data.paymentMethod}</div>

          <div>Created:</div>
          <div>{data.createdAt}</div>
        </div>
      </div>

      {/* ===============================
          JOKI DETAIL
      ================================= */}

      {data.joki && (
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold">Detail Joki</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Status Joki:</div>
            <div>
              <JokiStatusBadge status={data.joki.status} />
            </div>

            <div>Login Via:</div>
            <div>{formatLoginVia(data.joki.loginVia)}</div>

            <div>User ID / Nickname:</div>
            <div>{data.joki.userIdNickname}</div>

            {/* Login ID + Copy */}
            <div>Email/No.Hp/Moonton ID:</div>
            <div className="flex items-center gap-3 min-w-0">
              <span className="truncate">{data.joki.loginId}</span>
              <CopyBtn value={data.joki.loginId} label="Login ID" />
            </div>

            {/* Password + Copy */}
            <div>Password:</div>
            <div className="flex items-center gap-3 min-w-0">
              <span className="truncate text-red-400 font-mono">{data.joki.password}</span>
              <CopyBtn value={data.joki.password} label="Password" />
            </div>

            <div>Catatan:</div>
            <div>{data.joki.noteForJoki || "-"}</div>
          </div>

          {/* HERO REQUEST */}
          <div>
            <div className="text-sm mb-2 font-semibold">Hero Request:</div>

            <div className="flex flex-wrap gap-2">
              {data.joki.heroRequests.map((h, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
