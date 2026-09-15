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
  return (
    <>
      <OfferPopup />
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
      <Footer />
    </>
  );
}
