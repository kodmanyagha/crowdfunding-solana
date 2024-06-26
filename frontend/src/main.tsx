import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { Buffer } from "buffer";
import { BrowserRouter } from "react-router-dom";
import ThemeContextProvider from "./components/context/theme-context-provider";

import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";

// @ts-ignore
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <App />
      </ThemeContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
