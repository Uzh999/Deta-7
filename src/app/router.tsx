import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "../App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/ru" replace />,
  },
  {
    path: "/:lang",
    element: <App />,
  },
  {
    path: "*",
    element: <Navigate to="/ru" replace />,
  },
]);

export default router;
