import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "../App";
import { DEFAULT_LANGUAGE } from "./languages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />,
  },
  {
    path: "/:lang",
    element: <App />,
  },
  {
    path: "*",
    element: <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />,
  },
]);

export default router;
