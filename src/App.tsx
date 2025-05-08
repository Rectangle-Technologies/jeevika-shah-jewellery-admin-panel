import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import Dashboard from "./dashboard/Dashboard";

const App = () => (
  <Dashboard />
);

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);