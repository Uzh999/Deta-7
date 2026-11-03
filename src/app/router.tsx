import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LanguageRedirect from "./LanguageRedirect";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LanguageRedirect />,
  },
  {
    path: "/:lang",
    element: <App />,
  },
  {
    path: "*",
    element: <LanguageRedirect />,
  },
]);

export default router;
