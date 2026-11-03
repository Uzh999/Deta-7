import { Navigate, useLocation } from "react-router-dom";
import { detectPreferredLanguage } from "./detectLanguage";

/** Sends a URL without a language to the visitor's language, keeping the hash. */
export default function LanguageRedirect() {
  const { hash } = useLocation();
  return <Navigate to={`/${detectPreferredLanguage()}${hash}`} replace />;
}
