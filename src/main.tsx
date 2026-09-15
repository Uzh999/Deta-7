import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./app/router";
import "./i18n";

/* Inter was declared in globals.css but never actually loaded, so the site
   rendered in the system UI font. Self-hosted here: no third-party request,
   no layout shift from a late-arriving webfont. */
import "@fontsource-variable/inter";

import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
