import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LupaPasswordClient from "./LupaPasswordClient";

export default function LupaPasswordPage() {
  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <div className="shell">
        <Navbar />
        <LupaPasswordClient />
      </div>
      <Footer />
    </main>
  );
}
