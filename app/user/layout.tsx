import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UserSidebar from "../components/UserSidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="page">
      {/* Background Effects */}
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      
      <Navbar />
      <div className="shell" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        <div style={{ 
          marginTop: 40,
          marginBottom: 60,
          display: "grid", 
          gridTemplateColumns: "260px 1fr", 
          gap: 32,
          flexGrow: 1, // Membantu mendorong footer ke bawah
          alignItems: "start"
        }}>
          {/* Kiri: Sidebar Navigasi Dashboard */}
          <div className="userSidebarWrapper">
            <UserSidebar />
          </div>

          {/* Kanan: Main Content Area (Children) */}
          <div className="userContentWrapper" style={{ minWidth: 0 }}>
            {children}
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Basic responsive layout injection specifically for User Dashboard */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .shell > div {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            margin-top: 20px !important;
          }
          .userSidebarWrapper {
            margin-bottom: 0;
          }
        }
      `}} />
    </main>
  );
}
