import LanguageRouteSync from "./app/providers/LanguageRouteSync";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <LanguageRouteSync>
      <HomePage />
    </LanguageRouteSync>
  );
}
