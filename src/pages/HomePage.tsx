import { useTranslation } from "react-i18next";

import OfferPopup from "../components/OfferPopup/OfferPopup";
import Hero from "../sections/Hero/Hero";
import Services from "../sections/Services/Services";
import BeforeAfter from "../sections/BeforeAfter/BeforeAfter";
import About from "../sections/About/About";
import Pricing from "../sections/Pricing/Pricing";
import IndividualServices from "../sections/individual-services/IndividualServices";
import Reviews from "../sections/Reviews/Reviews";
import FAQ from "../sections/FAQ/FAQ";
import Contact from "../sections/Contact/Contact";
import Location from "../sections/Location/Location";
import Footer from "../sections/Footer/Footer";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      {/* First tab stop: lets keyboard users jump past the nav. */}
      <a href="#main" className="skipLink">
        {t("a11y.skipToContent")}
      </a>

      <OfferPopup />

      <main id="main">
        <Hero />
        <Services />
        <BeforeAfter />
        <About />
        <Pricing />
        <IndividualServices />
        <Reviews />
        <FAQ />
        <Contact />
        <Location />
      </main>

      <Footer />
    </>
  );
}
