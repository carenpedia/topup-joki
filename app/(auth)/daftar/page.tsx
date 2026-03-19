import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DaftarClient from "./DaftarClient";

export default function DaftarPage() {
  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <div className="shell">
        <Navbar />
        <DaftarClient />
      </div>
      <Footer />
    </main>
  );
}
