import "../components/styles.css"; // pastikan global css kamu kebaca
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page pagePadBottom">
      <div className="shell">
        <AdminTopbar />
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
          <AdminSidebar />
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
