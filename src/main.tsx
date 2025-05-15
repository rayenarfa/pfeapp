import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./routes/Router";

// Main entry point for the application
// Creates a root element and renders the Router component within React's StrictMode
createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
