import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Clarigggz: Mounting Application...");

window.onerror = (msg, url, line, col, error) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="background: #200; color: #ff5555; padding: 20px; font-family: monospace;">
      <h1>CRITICAL LOAD ERROR</h1>
      <p>${msg}</p>
      <pre>${error?.stack || ''}</pre>
    </div>`;
  }
  return false;
};

try {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log("Clarigggz: Render Initiated");
} catch (e: any) {
  console.error("Mounting failed:", e);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="background: #200; color: #ff5555; padding: 20px; font-family: monospace;">
      <h1>MOUNT ERROR</h1>
      <p>${e.message}</p>
    </div>`;
  }
}
