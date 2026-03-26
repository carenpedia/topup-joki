import MasukClient from "./MasukClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Page() {
  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />
      <div className="shell">
        <MasukClient />
      </div>
      <Footer />
    </main>
  );
}
