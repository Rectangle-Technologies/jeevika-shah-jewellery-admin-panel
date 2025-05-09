import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import Dashboard from "./dashboard/Dashboard";
import { SnackbarProvider } from "notistack";

const App = () => (
  <BrowserRouter>
    <SnackbarProvider
      preventDuplicate
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      maxSnack={3}
    >
      <Dashboard />
    </SnackbarProvider>
  </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);