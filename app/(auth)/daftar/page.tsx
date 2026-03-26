import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DaftarClient from "./DaftarClient";

export default function DaftarPage() {
  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />
      <div className="shell">
        <DaftarClient />
      </div>
      <Footer />
    </main>
  );
}
